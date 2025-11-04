import mongoose, { Schema } from 'mongoose';
const STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];
const SISTEMA_ACTIVO = ['AC', 'SOLAR', 'AMBOS', 'NINGUNO'];
const LUCES_OBST = ['SI', 'NO', 'N/A'];
const EquipmentSchema = new Schema({
    tipo: { type: String, trim: true, maxlength: [100, 'Tipo demasiado largo'] },
    modelo: { type: String, trim: true, maxlength: [100, 'Modelo demasiado largo'] },
    serial: { type: String, trim: true, maxlength: [100, 'Serial demasiado largo'] },
}, { _id: false });
const cctvReportSchema = new Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Orden de trabajo requerida'],
        index: true,
    },
    camaraNo: {
        type: Number,
        required: [true, 'Número de cámara requerido'],
        min: [1, 'Número de cámara debe ser ≥1'],
    },
    rutinaNo: {
        type: Number,
        required: [true, 'Número de rutina requerido'],
        min: [1, 'Número de rutina debe ser ≥1'],
    },
    lugar: {
        type: String,
        required: [true, 'Lugar requerido'],
        trim: true,
        maxlength: [200, 'Lugar máximo 200 caracteres'],
    },
    fecha: {
        type: Date,
        required: [true, 'Fecha requerida'],
        default: Date.now,
        index: true,
    },
    alturaEstructura: {
        type: Number,
        min: [0, 'Altura estructura no negativa'],
        required: [true, 'Altura de estructura requerida'],
    },
    alturaCamara: {
        type: Number,
        min: [0, 'Altura cámara no negativa'],
        required: [true, 'Altura de cámara requerida'],
    },
    distanciaCamCaja: {
        type: Number,
        min: [0, 'Distancia no negativa'],
        required: [true, 'Distancia cámara-caja requerida'],
    },
    camara: EquipmentSchema,
    encoderPoe: EquipmentSchema,
    radio: EquipmentSchema,
    antenaExterna: new Schema({
        ...EquipmentSchema.obj,
        nombre: { type: String, trim: true, maxlength: [100, 'Nombre antena demasiado largo'] },
    }),
    switchEquipo: EquipmentSchema,
    ubicacion: {
        type: String,
        trim: true,
        maxlength: [200, 'Ubicación máximo 200 caracteres'],
    },
    master: {
        radio: EquipmentSchema,
    },
    electrico: {
        ac110: { type: Boolean, default: false },
        fotovoltaico: { type: Boolean, default: false },
        cajaConexion: { type: Boolean, default: false },
        transferenciaAutomatica: { type: Boolean, default: false },
        puestaTierraOk: { type: Boolean, default: false },
        sistemaActivo: {
            type: String,
            enum: SISTEMA_ACTIVO,
            default: 'NINGUNO',
        },
        alimentacionOrigen: { type: String, trim: true, maxlength: [100] },
        gabineteBaseTorre: { type: String, trim: true, maxlength: [100] },
        tbt: { type: String, trim: true, maxlength: [100] },
        lucesObstruccion: { type: String, enum: LUCES_OBST, default: 'N/A' },
    },
    observaciones: {
        type: String,
        trim: true,
        maxlength: [2000, 'Observaciones máximo 2000 caracteres'],
    },
    alcance: {
        type: String,
        trim: true,
        maxlength: [2000, 'Alcance máximo 2000 caracteres'],
    },
    fotos: {
        camaraAntes: [{ type: String }],
        camaraDespues: [{ type: String }],
        radioAntes: [{ type: String }],
        radioDespues: [{ type: String }],
        cajaAntes: [{ type: String }],
        cajaDespues: [{ type: String }],
        electricaAntes: [{ type: String }],
        electricaDespues: [{ type: String }],
        patAntes: [{ type: String }],
        patDespues: [{ type: String }],
        generalAntes: [{ type: String }],
        generalDespues: [{ type: String }],
    },
    tecnicoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Técnico requerido'],
        index: true,
    },
    status: {
        type: String,
        enum: STATUSES,
        default: 'DRAFT',
        index: true,
    },
    aprobadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    fechaAprobacion: { type: Date, index: true },
    comentariosAprobacion: { type: String, trim: true, maxlength: 1000 },
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    strict: true,
    collection: 'cctvreports',
});
cctvReportSchema.index({ orderId: 1, fecha: -1 });
cctvReportSchema.index({ lugar: 1, fecha: -1 });
cctvReportSchema.index({ tecnicoId: 1, fecha: -1 });
cctvReportSchema.index({ status: 1, fecha: -1 });
cctvReportSchema.index({ aprobadoPor: 1, fecha: -1 });
cctvReportSchema.virtual('totalFotos').get(function () {
    let total = 0;
    Object.values(this.fotos).forEach(arr => total += (Array.isArray(arr) ? arr.length : 0));
    return total;
});
cctvReportSchema.virtual('estaAprobado').get(function () {
    return this.status === 'APPROVED';
});
cctvReportSchema.virtual('requiereAprobacion').get(function () {
    return this.status === 'SUBMITTED';
});
cctvReportSchema.methods.isComplete = function () {
    const requiredSections = ['camara', 'encoderPoe', 'radio', 'electrico', 'observaciones'];
    return requiredSections.every(section => this[section] && Object.keys(this[section]).length > 0);
};
cctvReportSchema.statics.findByDateRange = async function (startDate, endDate, options = {}) {
    const { page = 1, limit = 20, populate = 'orderId tecnicoId aprobadoPor', sort = { fecha: -1 } } = options;
    const skip = (page - 1) * limit;
    const match = { fecha: { $gte: startDate, $lte: endDate } };
    const [docs, total] = await Promise.all([
        this.find(match).sort(sort).skip(skip).limit(limit).populate(populate).lean(),
        this.countDocuments(match),
    ]);
    return {
        docs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    };
};
cctvReportSchema.statics.findByOrderAndDate = async function (orderId, startDate, endDate, options = {}) {
    const match = { orderId };
    if (startDate && endDate) {
        match['fecha'] = { $gte: startDate, $lte: endDate };
    }
    return this.find(match)
        .sort({ fecha: -1 })
        .populate('tecnicoId aprobadoPor', 'nombre email rol')
        .select(options.select || '-fotos')
        .lean();
};
cctvReportSchema.statics.getPendingApprovals = async function (approverId = null, limit = 50) {
    const match = { status: 'SUBMITTED' };
    if (approverId)
        match.aprobadoPor = approverId;
    return this.find(match)
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('orderId tecnicoId', 'titulo lugar nombre')
        .lean();
};
cctvReportSchema.pre('save', async function (next) {
    if (this.isNew) {
    }
    next();
});
const CctvReport = mongoose.model('CctvReport', cctvReportSchema);
export default CctvReport;
//# sourceMappingURL=CctvReport.js.map