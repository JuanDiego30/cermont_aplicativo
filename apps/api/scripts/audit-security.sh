#!/bin/bash

# 🔐 AUDITORÍA DE SEGURIDAD CERMONT
# Ejecutar: bash scripts/audit-security.sh

echo "🔐 INICIANDO AUDITORÍA DE SEGURIDAD"
echo "=================================="

PASS=0
FAIL=0

# 1. VERIFICAR ENV VALIDATION
echo ""
echo "1️⃣  VERIFICANDO ENV VALIDATION..."
if grep -r "validateEnv\|ConfigModule" src/main.ts > /dev/null 2>&1; then
    echo "✅ Validación de ENV presente"
    ((PASS++))
else
    echo "❌ FALTA: Validación de ENV en main.ts"
    ((FAIL++))
fi

# 2. VERIFICAR QUE NO HAY SECRETS HARDCODEADOS
echo ""
echo "2️⃣  BUSCANDO SECRETS HARDCODEADOS..."
SECRETS_FOUND=$(grep -rE "(password|secret|apikey)\s*[:=]\s*['\"][^'\"]+['\"]" src/ --include="*.ts" 2>/dev/null | grep -v ".spec.ts\|test\|example" | wc -l)
if [ "$SECRETS_FOUND" -eq 0 ]; then
    echo "✅ No hay secrets hardcodeados"
    ((PASS++))
else
    echo "⚠️  Posibles secrets encontrados: $SECRETS_FOUND"
    ((FAIL++))
fi

# 3. VERIFICAR CONSOLE.LOG
echo ""
echo "3️⃣  BUSCANDO console.log..."
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.ts" 2>/dev/null | grep -v ".spec.ts\|test" | wc -l)
if [ "$CONSOLE_LOGS" -lt 5 ]; then
    echo "✅ Pocos console.log ($CONSOLE_LOGS)"
    ((PASS++))
else
    echo "⚠️  Muchos console.log: $CONSOLE_LOGS"
    ((FAIL++))
fi

# 4. VERIFICAR HELMET
echo ""
echo "4️⃣  VERIFICANDO HELMET..."
if grep -r "helmet" src/main.ts > /dev/null 2>&1; then
    echo "✅ Helmet configurado"
    ((PASS++))
else
    echo "❌ FALTA: Helmet en main.ts"
    ((FAIL++))
fi

# 5. VERIFICAR CORS
echo ""
echo "5️⃣  VERIFICANDO CORS..."
if grep -r "enableCors\|cors" src/main.ts > /dev/null 2>&1; then
    echo "✅ CORS configurado"
    ((PASS++))
else
    echo "❌ FALTA: CORS en main.ts"
    ((FAIL++))
fi

# 6. VERIFICAR RATE LIMITING
echo ""
echo "6️⃣  VERIFICANDO RATE LIMITING..."
if grep -rE "Throttler|ThrottlerGuard|@Throttle" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Rate limiting configurado"
    ((PASS++))
else
    echo "❌ FALTA: Rate limiting"
    ((FAIL++))
fi

# 7. VERIFICAR PASSWORD HASHING
echo ""
echo "7️⃣  VERIFICANDO PASSWORD HASHING..."
if grep -rE "bcrypt|hash" src/modules/auth --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Password hashing implementado"
    ((PASS++))
else
    echo "❌ FALTA: Password hashing"
    ((FAIL++))
fi

# 8. VERIFICAR JWT
echo ""
echo "8️⃣  VERIFICANDO JWT..."
if grep -r "JwtStrategy\|JwtAuthGuard" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ JWT implementado"
    ((PASS++))
else
    echo "❌ FALTA: JWT"
    ((FAIL++))
fi

# 9. VERIFICAR VALIDACIÓN DTOs
echo ""
echo "9️⃣  VERIFICANDO VALIDACIÓN DTOs..."
DTO_COUNT=$(find src/modules -name "*.dto.ts" 2>/dev/null | wc -l)
VALIDATORS=$(grep -rE "@Is|@Min|@Max|@ApiProperty" src/modules --include="*.dto.ts" 2>/dev/null | wc -l)
if [ "$VALIDATORS" -gt 10 ]; then
    echo "✅ Validación de DTOs ($DTO_COUNT DTOs, $VALIDATORS validadores)"
    ((PASS++))
else
    echo "⚠️  Pocos validadores: $VALIDATORS"
    ((FAIL++))
fi

# 10. VERIFICAR LOGGING
echo ""
echo "🔟 VERIFICANDO LOGGING..."
if grep -rE "Logger|Winston|this\.logger" src/ --include="*.ts" > /dev/null 2>&1; then
    echo "✅ Logging implementado"
    ((PASS++))
else
    echo "❌ FALTA: Logging estructurado"
    ((FAIL++))
fi

echo ""
echo "=================================="
echo "📊 RESULTADO: $PASS ✅ / $FAIL ❌"
if [ "$FAIL" -eq 0 ]; then
    echo "🎉 AUDITORÍA DE SEGURIDAD COMPLETADA"
else
    echo "⚠️  HAY $FAIL ITEMS A CORREGIR"
fi
echo "=================================="
