import mongoose, { Schema } from 'mongoose';
import argon2 from 'argon2';
const UserSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    rol: {
        type: String,
        enum: ['root', 'admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'],
        default: 'technician'
    },
    telefono: { type: String, trim: true },
    cedula: { type: String, unique: true, sparse: true },
    cargo: { type: String },
    especialidad: { type: String },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lastLoginIP: { type: String },
    tokenVersion: { type: Number, default: 0 },
    refreshTokens: [{
            token: { type: String, required: true },
            expiresAt: { type: Date, required: true },
            device: { type: String, enum: ['desktop', 'mobile', 'tablet'], required: true },
            ip: { type: String, required: true },
            userAgent: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }],
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
}, {
    timestamps: true
});
UserSchema.index({ email: 1 });
UserSchema.index({ cedula: 1 });
UserSchema.index({ rol: 1, isActive: 1 });
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        this.password = await argon2.hash(this.password);
        next();
    }
    catch (error) {
        next(error);
    }
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return argon2.verify(this.password, candidatePassword);
};
UserSchema.statics.comparePasswordStatic = async function (password, hash) {
    return argon2.verify(hash, password);
};
UserSchema.statics.incrementLoginAttempts = async function (userId) {
    const lockTime = new Date(Date.now() + 30 * 60 * 1000);
    await this.findByIdAndUpdate(userId, {
        $inc: { loginAttempts: 1 },
        $set: { isLocked: true, lockUntil: lockTime }
    });
};
UserSchema.statics.resetLoginAttempts = async function (userId, ip) {
    await this.findByIdAndUpdate(userId, {
        $set: { loginAttempts: 0, isLocked: false, lockUntil: null, lastLoginIP: ip }
    });
};
UserSchema.statics.addRefreshTokenStatic = async function (userId, token, expiresAt, deviceInfo) {
    await this.findByIdAndUpdate(userId, {
        $push: {
            refreshTokens: {
                token,
                expiresAt,
                device: deviceInfo.device,
                ip: deviceInfo.ip,
                userAgent: deviceInfo.userAgent,
                createdAt: new Date()
            }
        }
    });
};
UserSchema.statics.removeRefreshTokenStatic = async function (userId, token) {
    await this.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token } }
    });
};
UserSchema.statics.invalidateAllTokensStatic = async function (userId) {
    await this.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] },
        $inc: { tokenVersion: 1 }
    });
};
UserSchema.statics.hasValidRefreshTokenStatic = function (user, token) {
    if (!user.refreshTokens || user.refreshTokens.length === 0)
        return false;
    return user.refreshTokens.some((rt) => rt.token === token && new Date(rt.expiresAt) > new Date());
};
const User = mongoose.model('User', UserSchema);
export default User;
const RefreshTokenSchema = new Schema({
    token: { type: String, required: true, select: false },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    device: { type: String, default: 'unknown', maxlength: [50] },
    ip: { type: String, maxlength: [45] },
    userAgent: { type: String, maxlength: [500] },
}, { _id: false });
const SecurityLogSchema = new Schema({
    action: {
        type: String,
        enum: ['password_change', 'email_change', 'role_change', 'account_locked', 'account_unlocked', 'tokens_invalidated'],
        required: true,
    },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, maxlength: [45] },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });
const userSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Nombre requerido'],
        trim: true,
        minlength: [2],
        maxlength: [100],
    },
    apellido: { type: String, trim: true, maxlength: [100] },
    email: {
        type: String,
        required: [true, 'Email requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido'],
    },
    password: {
        type: String,
        required: [true, 'Contraseña requerida'],
        minlength: [8],
        select: false,
    },
    rol: {
        type: String,
        enum: ROLES,
        default: ROLES[0],
        required: [true, 'Rol requerido'],
        index: true,
    },
    telefono: { type: String, trim: true, maxlength: [20] },
    cedula: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    cargo: { type: String, trim: true, maxlength: [100] },
    especialidad: { type: String, trim: true, maxlength: [100] },
    avatar: { type: String, default: null, maxlength: [500] },
    isActive: { type: Boolean, default: true, index: true },
    tokenVersion: { type: Number, default: 0, select: false },
    refreshTokens: [RefreshTokenSchema],
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLogin: { type: Date, default: null },
    lastLoginIp: { type: String, select: false, maxlength: [45] },
    lastPasswordChange: { type: Date, default: Date.now, select: false },
    securityLog: [SecurityLogSchema],
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        getters: true,
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.loginAttempts;
            delete ret.lockUntil;
            delete ret.securityLog;
            delete ret.refreshToken;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            delete ret.tokenVersion;
            delete ret.lastLoginIp;
            delete ret.lastPasswordChange;
            delete ret.createdBy;
            delete ret.updatedBy;
        }
    },
    toObject: { virtuals: true, getters: true },
    strict: true,
    collection: 'users',
});
userSchema.index({ rol: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastLogin: -1 });
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ especialidad: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ nombre: 'text', email: 'text', cargo: 'text', especialidad: 'text' });
userSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombre}${this.apellido ? ` ${this.apellido}` : ''}`.trim();
});
userSchema.virtual('iniciales').get(function () {
    const parts = this.nombreCompleto.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().substring(0, 3);
});
userSchema.virtual('isLocked').get(function () {
    return this.lockUntil && this.lockUntil > new Date();
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.password.length === 0)
        return next();
    try {
        this.password = await hashPassword(this.password);
        if (!this.isNew) {
            this.lastPasswordChange = new Date();
            this.securityLog.push({
                action: 'password_change',
                timestamp: new Date(),
                performedBy: this.updatedBy || this._id,
            });
            if (this.securityLog.length > 10)
                this.securityLog = this.securityLog.slice(-10);
        }
    }
    catch (error) {
        return next(error);
    }
    next();
});
userSchema.pre('save', function (next) {
    if (this.refreshTokens) {
        this.refreshTokens = this.refreshTokens.filter((rt) => rt.expiresAt > new Date());
        if (this.refreshTokens.length > 5)
            this.refreshTokens = this.refreshTokens.slice(-5);
    }
    if (this.refreshToken) {
        this.refreshToken = undefined;
        logger.warn(`Deprecated single refreshToken cleaned for user: ${this.email}`);
    }
    if (this.isModified() && !this.isNew)
        this.updatedBy = this.updatedBy || this._id;
    next();
});
userSchema.post('save', async function (doc, next) {
    try {
        const action = doc.isNew ? 'CREATE_USER' : 'UPDATE_USER';
        const description = doc.isNew ? `Usuario creado: ${doc.nombreCompleto}` : `Usuario actualizado: ${doc.nombreCompleto}`;
        const metadata = {
            rol: doc.rol,
            especialidad: doc.especialidad,
            email: doc.email,
            changes: doc.isModified('rol') ? { old: null, new: doc.rol } : null,
        };
        if (doc.isModified('password'))
            metadata.passwordChanged = true;
        await AuditLog.log({
            userId: doc.createdBy || doc.updatedBy || doc._id,
            action,
            resource: 'User',
            resourceId: doc._id,
            description,
            metadata,
            status: 'SUCCESS',
            severity: doc.isModified('rol') || doc.isModified('password') ? 'MEDIUM' : 'LOW',
        });
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Audit error';
        logger.error('[User] Audit failed', { error: errMsg, userId: doc._id });
    }
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    try {
        const hashType = detectHashType(this.password);
        if (hashType === 'bcrypt') {
            const isMatch = await bcrypt.compare(candidatePassword, this.password);
            if (isMatch) {
                try {
                    this.password = await hashPassword(candidatePassword);
                    await this.save({ validateBeforeSave: false });
                    logger.info(`Password migrated to Argon2 for: ${this.email}`);
                }
                catch (rehashErr) {
                    logger.error('Password rehash failed', rehashErr);
                }
            }
            return isMatch;
        }
        else if (hashType === 'argon2') {
            return await verifyPassword(this.password, candidatePassword);
        }
        return false;
    }
    catch (error) {
        logger.error('Password comparison error', error);
        throw new Error('Error en comparación de contraseña');
    }
};
userSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        nombre: this.nombreCompleto,
        email: this.email,
        rol: this.rol,
        telefono: this.telefono,
        cedula: this.cedula,
        cargo: this.cargo,
        especialidad: this.especialidad,
        avatar: this.avatar,
        isActive: this.isActive,
        tokenVersion: this.tokenVersion,
        lastLogin: this.lastLogin,
    };
};
userSchema.methods.hasRole = function (role) {
    return this.rol === role;
};
userSchema.methods.hasMinRole = function (minRole) {
    return ROLE_HIERARCHY[this.rol] >= ROLE_HIERARCHY[minRole];
};
userSchema.methods.incrementLoginAttempts = async function (ip) {
    if (this.lockUntil && this.lockUntil < new Date()) {
        await this.updateOne({ $set: { loginAttempts: 1, lockUntil: undefined } });
        this.loginAttempts = 1;
        this.lockUntil = undefined;
        return this;
    }
    const updates = { $inc: { loginAttempts: 1 } };
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    const lockMinutes = parseInt(process.env.ACCOUNT_LOCKOUT_TIME_MIN || '15');
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
        const lockTime = new Date(Date.now() + lockMinutes * 60 * 1000);
        updates.$set = { ...updates.$set, lockUntil: lockTime };
        this.securityLog.push({ action: 'account_locked', timestamp: new Date(), ip });
        if (this.securityLog.length > 10)
            this.securityLog = this.securityLog.slice(-10);
        logger.warn(`User locked: ${this.email} after ${maxAttempts} attempts`);
    }
    await this.updateOne(updates);
    await this.save({ validateBeforeSave: false });
    const updated = await this.constructor.findById(this._id);
    if (updated)
        Object.assign(this, updated);
    return this;
};
userSchema.methods.resetLoginAttempts = async function (ip) {
    this.securityLog.push({ action: 'account_unlocked', timestamp: new Date(), ip });
    if (this.securityLog.length > 10)
        this.securityLog = this.securityLog.slice(-10);
    await this.updateOne({
        $set: { loginAttempts: 0, lastLogin: new Date(), lastLoginIp: ip, lockUntil: undefined },
    });
    await this.save({ validateBeforeSave: false });
    const updated = await this.constructor.findById(this._id);
    if (updated)
        Object.assign(this, updated);
    return this;
};
userSchema.methods.invalidateAllTokens = async function (performerId, ip) {
    this.tokenVersion += 1;
    this.refreshTokens = [];
    this.securityLog.push({
        action: 'tokens_invalidated',
        timestamp: new Date(),
        ip,
        performedBy: performerId,
    });
    if (this.securityLog.length > 10)
        this.securityLog = this.securityLog.slice(-10);
    logger.info(`All tokens invalidated for: ${this.email}`);
    return this.save();
};
userSchema.methods.addRefreshToken = async function (token, expiresAt, device = 'unknown', ip, userAgent) {
    if (this.refreshTokens.length >= 5)
        this.refreshTokens.shift();
    this.refreshTokens.push({ token, expiresAt, device, ip, userAgent });
    return this.save();
};
userSchema.methods.removeRefreshToken = async function (token) {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
    return this.save();
};
userSchema.methods.hasValidRefreshToken = function (token) {
    return this.refreshTokens.some(rt => rt.token === token && rt.expiresAt > new Date());
};
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() })
        .select('+password +loginAttempts +lockUntil +tokenVersion +refreshTokens +securityLog');
};
userSchema.statics.findByRole = function (role, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    return this.find({ rol: role, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('updatedBy', 'nombre')
        .select('-password -refreshTokens')
        .lean();
};
userSchema.statics.findActive = function (options = {}) {
    const { page = 1, limit = 50, especialidad = null } = options;
    const query = { isActive: true };
    if (especialidad)
        query.especialidad = { $regex: especialidad, $options: 'i' };
    const skip = (page - 1) * limit;
    return this.find(query)
        .sort({ lastLogin: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -refreshTokens -securityLog')
        .lean();
};
userSchema.statics.search = function (query, options = {}) {
    const { page = 1, limit = 20, rol = null } = options;
    const match = { $text: { $search: `"${query}"` }, isActive: true };
    if (rol)
        match.rol = rol;
    const skip = (page - 1) * limit;
    return this.find(match, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -refreshTokens')
        .lean();
};
userSchema.statics.getStats = async function () {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$rol',
                count: { $sum: 1 },
                avgLastLogin: { $avg: { $ifNull: ['$lastLogin', new Date(0)] } },
                especialidades: { $addToSet: '$especialidad' },
            },
        },
        { $sort: { count: -1 } },
    ]);
};
userSchema.statics.getByEspecialidad = function (especialidad) {
    return this.find({
        especialidad: { $regex: especialidad, $options: 'i' },
        isActive: true,
        rol: { $in: [ROLES[0], 'ENGINEER'] }
    })
        .select('nombreCompleto especialidad telefono')
        .sort({ nombre: 1 })
        .lean();
};
userSchema.statics.getMisOrdenes = function (userId) {
    return this.model('Order').find({ asignadoA: userId, isActive: true }).sort({ fechaInicio: -1 }).lean();
};
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
};
userSchema.statics.comparePasswordStatic = async function (plainPassword, hashedPassword) {
    return verifyPassword(plainPassword, hashedPassword);
};
userSchema.statics.incrementLoginAttempts = async function (userId) {
    const user = await this.findById(userId);
    if (!user)
        throw new Error('Usuario no encontrado');
    return user.incrementLoginAttempts();
};
userSchema.statics.resetLoginAttempts = async function (userId, ip) {
    const user = await this.findById(userId);
    if (!user)
        throw new Error('Usuario no encontrado');
    return user.resetLoginAttempts(ip);
};
userSchema.statics.addRefreshTokenStatic = async function (userId, token, expiresAt, metadata) {
    const user = await this.findById(userId);
    if (!user)
        throw new Error('Usuario no encontrado');
    return user.addRefreshToken(token, expiresAt, metadata?.device, metadata?.ip, metadata?.userAgent);
};
userSchema.statics.removeRefreshTokenStatic = async function (userId, token) {
    const user = await this.findById(userId);
    if (!user)
        throw new Error('Usuario no encontrado');
    return user.removeRefreshToken(token);
};
userSchema.statics.hasValidRefreshTokenStatic = function (user, token) {
    return user.hasValidRefreshToken(token);
};
userSchema.statics.invalidateAllTokensStatic = async function (userId) {
    const user = await this.findById(userId);
    if (!user)
        throw new Error('Usuario no encontrado');
    return user.invalidateAllTokens();
};
const User = mongoose.model('User', userSchema);
export default User;
//# sourceMappingURL=User.js.map