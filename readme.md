# **_Express JS + PostgreSQL app_**

# Futtatás

#### szükséges: Node v16, PostgreSQL 14

## I. package-k telepítése

    npm install

## II. Prisma adatbázis/táblák/adatok

#### 1.) hozz létre egy .env fájlt és másold bele a database url-t (generáld le az ACCESS_TOKEN_SECRET-et és a BCRYPT_SALT-ot):

    DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"

    ACCESS_TOKEN_SECRET=

    PLAIN_PASSWORD=pass

    BCRYPT_SALT=

    EXPIRE_TIME=600s

#### 2.) migráció:

    npx prisma migrate dev --name MIGRATION_NAME

#### !!! ha nem sikerült a seed-elés

    npx prisma db seed

## III. futtatás(dev környezetben)

    ExpressJS szerver:
        cd expressjs-server
        npm run dev

    Blazor kliens:
        BlazorWasmClient
        dotnet run

### Egyéb parancsok

- Swagger doku generálás és szerver indítás

        node swagger.js

- seed-elés

        npx prisma db seed

- adatbázis reset

        npx prisma migrate reset

- prisma client telepítés

        npm install @prisma/client

- prisma studio

        npx prisma studio

  [prisma studio](http://localhost:5555/)

### Endpointok

#### szerver home oldal: [localhost/](http://localhost:5000)

#### szerver swagger dokumentáció: [localhost/api/docs/](http://localhost:5000/api/docs/)

### kliens login oldal: [login/]https://localhost:7150/login

### Csomagok

    @prisma/client
    bcrypt
    cors
    dotenv
    express
    express-validation
    fs
    jsonwebtoken
    path
    pg
    swagger-autogen
    swagger-jsdoc
    swagger-ui-express
    winston
    winston-daily-rotate-file
    xlsx

    Dev:
        nodemon
        prisma
