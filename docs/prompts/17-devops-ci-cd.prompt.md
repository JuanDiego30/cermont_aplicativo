# ⚙️ CERMONT DEVOPS CI/CD AGENT

**Responsabilidad:** GitHub Actions, Docker, Deployment  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT DEVOPS CI/CD AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: .github/workflows/**, Dockerfiles
   - CI pasa antes de merge
   - Tests en pipeline, deps sin vulnerabilidades
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: GitHub Actions pasa
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **GitHub Actions**
   - ¿Existen workflows (test, build, deploy)?
   - ¿Se ejecutan en push/PR?

2. **Tests en Pipeline**
   - ¿Tests se ejecutan antes de merge?
   - ¿Cobertura >70%?

3. **Vulnerabilidades**
   - ¿Dependencias actualizadas?
   - ¿Dependabot configurado?

4. **Docker**
   - ¿Existen Dockerfiles?
   - ¿Son multi-stage?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] GitHub Actions workflows
- [ ] Tests en CI pipeline
- [ ] Cobertura >70%
- [ ] Dependabot para vulnerabilidades
- [ ] Dockerfiles multi-stage
- [ ] docker-compose para dev

---

## 🧪 VERIFICACIÓN

```bash
# Ver workflows
ls -la .github/workflows/

# Esperado: test.yml, build.yml, deploy.yml

# Verificar Docker
docker --version
ls -la Dockerfile

# Esperado: Docker instalado, Dockerfile presente

# Build Docker
docker build -t cermont:test .

# Esperado: Build exitoso

# Verificar docker-compose
cat docker-compose.yml | head -20

# Esperado: Services: api, web, db presentes

# Levantar ambiente
docker-compose up -d

# Esperado: Servicios online

# Ver logs
docker-compose logs -f api | head -20

# Esperado: Servidor running

# Verificar GitHub Actions en web
# https://github.com/JuanDiego30/cermont_aplicativo/actions
# Esperado: Workflows en verde (passing)
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
