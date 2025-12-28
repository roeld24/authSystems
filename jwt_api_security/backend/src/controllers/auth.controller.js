const bcrypt = require('bcrypt');
const Employee = require('../models/employee.model');
const AuditLog = require('../models/auditLog.model');
const TokenUtils = require('../utils/tokenUtils');

class AuthController {
    /**
     * Login
     */
    static async login(req, res) {
    try {
        const { email, password } = req.body;

        console.log('[DEBUG] Login attempt:', { email });

        if (!email || !password) {
            console.log('[DEBUG] Missing email or password');
            return res.status(400).json({ error: 'Email e password sono obbligatori' });
        }

        const sanitizedEmail = email.trim().toLowerCase();
        console.log('[DEBUG] Sanitized email:', sanitizedEmail);

        const employee = await Employee.findByEmail(sanitizedEmail);
        console.log('[DEBUG] EmployeeA fetched from DB:', employee ? employee.id : null);

        if (!employee) {
            await AuditLog.log(null, AuditLog.ACTIONS.LOGIN_FAILED, `Email not found: ${sanitizedEmail}`, req);
            console.log('[DEBUG] Email non trovata');
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        if (employee.accountLocked) {
            await AuditLog.log(employee.id, AuditLog.ACTIONS.ACCOUNT_LOCKED, 'Login attempt on locked account', req);
            console.log('[DEBUG] Account bloccato');
            return res.status(403).json({ error: 'Account bloccato per troppi tentativi falliti. Contatta un amministratore.' });
        }

        const isValidPassword = await bcrypt.compare(password, employee.password);

        if (!isValidPassword) {
            await Employee.incrementFailedAttempts(sanitizedEmail);
            await AuditLog.logLogin(employee.id, false, req, `Invalid password. Attempts: ${employee.failedLoginAttempts + 1}`);
            console.log('[DEBUG] Password non valida, tentativi falliti incrementati');
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        await Employee.resetFailedAttempts(employee.id);
        await Employee.updateLastActivity(employee.id);

        const isManager = employee.Title && employee.Title.toLowerCase().includes('manager');
        console.log('[DEBUG] User isManager:', isManager);

        const payload = {
            userId: employee.id,
            email: employee.Email,
            firstName: employee.FirstName,
            lastName: employee.LastName,
            isManager
        };

        const accessToken = TokenUtils.generateJWT(payload);
        const refreshToken = TokenUtils.generateRefreshToken({ userId: employee.id });

        await TokenUtils.saveRefreshToken(employee.id, refreshToken);
        await AuditLog.logLogin(employee.id, true, req);

        console.log('[DEBUG] Login successful for user:', employee.id);

        res.json({
    message: 'Login effettuato con successo',
    user: {
        id: employee.id,
        firstName: employee.FirstName,
        lastName: employee.LastName,
        email: employee.Email,
        title: employee.Title,
        isManager
    },
    tokens: { accessToken, refreshToken },
    tokenInfo: { 
        expiresIn: isManager ? '5m' : '2m',
        refreshExpiresIn: '7d' 
    }
});

    } catch (error) {
        console.error('Errore login:', error);
        res.status(500).json({ error: 'Errore durante il login' });
    }
}

    /**
     * Refresh token
     */
static async refresh(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: 'Refresh token mancante' });

        console.log('🔍 Verifying refresh token...');
        const decoded = TokenUtils.verifyRefreshToken(refreshToken);
        
        console.log('🔍 Validating refresh token in database...');
        const isValid = await TokenUtils.validateRefreshToken(decoded.userId, refreshToken);
        
        if (!isValid) {
            console.log('❌ REFRESH TOKEN SCADUTO O REVOCATO nel database');
            return res.status(401).json({ error: 'Refresh token non valido o revocato' });
        }

        const employee = await Employee.findById(decoded.userId);
        if (!employee) return res.status(404).json({ error: 'Utente non trovato' });

        await Employee.updateLastActivity(employee.id);
        const isManager = employee.Title && employee.Title.toLowerCase().includes('manager');

        const payload = {
            userId: employee.id,
            email: employee.Email,
            firstName: employee.FirstName,
            lastName: employee.LastName,
            isManager
        };

        const newAccessToken = TokenUtils.generateJWT(payload);
        await AuditLog.logTokenRefresh(employee.id, req);

        const expiresIn = isManager ? '5m' : '2m';
        console.log(`✅ Token refreshed for ${employee.Email} (${isManager ? 'Manager' : 'Employee'}) - expires in ${expiresIn}`);

        res.json({ 
            message: 'Token rinnovato', 
            accessToken: newAccessToken,
            expiresIn 
        });

    } catch (error) {
        console.error('❌ Errore refresh:', error.message);
        
        if (error.message === 'Refresh token non valido') {
            console.log('⏰ REFRESH TOKEN JWT SCADUTO - Il token JWT ha superato il tempo di validità');
        }
        
        res.status(401).json({ error: 'Refresh token non valido' });
    }
}
    /**
     * Logout
     */
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            const employeeId = req.user?.userId;

            if (refreshToken) await TokenUtils.revokeRefreshToken(refreshToken);
            if (employeeId) await AuditLog.logLogout(employeeId, req, 'manual');

            res.json({ message: 'Logout effettuato' });
        } catch (error) {
            console.error('Errore logout:', error);
            res.status(500).json({ error: 'Errore durante il logout' });
        }
    }

    /**
     * Cambio password
     */
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const employeeId = req.user.userId;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Password corrente e nuova password sono obbligatorie' });
            }

            const passwordValidation = TokenUtils.validatePasswordComplexity(newPassword);
            if (!passwordValidation.valid) {
                return res.status(400).json({ error: 'Password non valida', requirements: passwordValidation.errors });
            }

            const employee = await Employee.findByEmail(req.user.email);
            if (!employee) return res.status(404).json({ error: 'Utente non trovato' });

            const isValidPassword = await bcrypt.compare(currentPassword, employee.password);
            if (!isValidPassword) {
                await AuditLog.log(employeeId, AuditLog.ACTIONS.PASSWORD_CHANGE_FAILED, 'Invalid current password', req);
                return res.status(401).json({ error: 'Password corrente non corretta' });
            }

            const isSamePassword = await bcrypt.compare(newPassword, employee.password);
            if (isSamePassword) return res.status(400).json({ error: 'La nuova password non può essere uguale alla password corrente' });

            const isReused = await Employee.isPasswordReused(employeeId, newPassword);
            if (isReused) return res.status(400).json({ error: 'Non puoi riutilizzare una password precedente' });

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await Employee.updatePassword(employeeId, hashedPassword);
            await AuditLog.logPasswordChange(employeeId, req);
            await TokenUtils.revokeAllRefreshTokens(employeeId);

            res.json({ message: 'Password cambiata con successo. Effettua nuovamente il login.' });

        } catch (error) {
            console.error('Errore cambio password:', error);
            res.status(500).json({ error: 'Errore durante il cambio password' });
        }
    }

    /**
     * Ottieni profilo utente corrente
     */
    static async getProfile(req, res) {
        try {
            const employee = await Employee.findById(req.user.userId);
            if (!employee) return res.status(404).json({ error: 'Utente non trovato' });

            const stats = await Employee.getStats(employee.id);
            const isManager = employee.Title && employee.Title.toLowerCase().includes('manager');

            res.json({
                user: {
                    id: employee.id,
                    firstName: employee.FirstName,
                    lastName: employee.LastName,
                    email: employee.Email,
                    title: employee.Title,
                    isManager,
                    hireDate: employee.HireDate,
                    lastActivity: employee.lastActivity
                },
                stats
            });

        } catch (error) {
            console.error('Errore profilo:', error);
            res.status(500).json({ error: 'Errore recupero profilo' });
        }
    }

    /**
     * Ottieni requisiti password (per UI)
     */
    static getPasswordRequirements(req, res) {
        res.json({
            requirements: {
                minLength: 6,
                maxLength: 14,
                mustContain: 'Almeno 3 delle seguenti categorie:',
                categories: [
                    'Lettere maiuscole (A-Z)',
                    'Lettere minuscole (a-z)',
                    'Numeri (0-9)',
                    'Caratteri speciali (-, !, $, #, %)'
                ]
            }
        });
    }
}

module.exports = AuthController;
