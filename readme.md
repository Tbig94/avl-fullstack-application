# **_Blazor + ExpressJS + PostgreSQL alkalmazás_**

## Futtatáshoz szükséges: Node v16 | PostgreSQL 14 | .NET 6.0

## I. Backend

#### navigálj az "avl-fullstack-application/expressjs-server" könyvtárban

#### 1.) package-ek telepítése:

    npm install

#### 2.) .env fájl

hozz létre egy .env a fájlt és másold bele a következőt (generáld le az ACCESS_TOKEN_SECRET-et és a BCRYPT_SALT-ot, add meg az adatbázishoz tartozó USERNAME, PASSWORD, DATABASE_NAME változókat)

    DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"

    ACCESS_TOKEN_SECRET=

    PLAIN_PASSWORD=pass

    BCRYPT_SALT=

    EXPIRE_TIME=600s

#### 3.) adatbázis létrehozás - migráció:

    npx prisma migrate dev --name MIGRATION_NAME

#### !!! ha nem sikerült a seed-elés

    npx prisma db seed

#### 4.) futtatás(dev környezetben)

    npm run dev

#### package-ek

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

## II. Frontend

#### 1.) futtatás(dev környezetben)

- navigálj a "avl-fullstack-application/BlazorWasmClient" könyvtárba:

        dotnet run

#### package-ek

    Microsoft.AspNetCore.Components.WebAssembly
    Microsoft.AspNetCore.Components.WebAssembly.DevServer
    Microsoft.AspNetCore.Cors
    Microsoft.Extensions.Http
    MudBlazor
    Newtonsoft.Json

### Endpointok

- #### [szerver - home oldal](http://localhost:5000)

- #### [szerver - swagger dokumentáció](http://localhost:5000/api/docs/)

- #### [kliens - login oldal](https://localhost:7150/login)
