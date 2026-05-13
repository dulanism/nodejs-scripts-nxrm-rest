# Node.js Scripts for the Nexus Repository REST API

## About
A toolbox of Node.js scripts that exercise Sonatype Nexus Repository Manager's
(NXRM) REST API. The scripts use [superagent](https://github.com/forwardemail/superagent)
to POST JSON payloads at the NXRM security endpoints so that roles and users can
be provisioned in bulk from a data file.

## Requirements
* `node` and `npm` installed locally
* A running NXRM instance reachable from your machine (the defaults assume
  `http://localhost:8081`)
* Admin credentials for that NXRM instance

Install dependencies:
```sh
npm install
```

## Configuration
Connection details live in [`src/env.js`](src/env.js) and may be overridden with
environment variables:

| Variable          | Default                                                            | Used for                |
|-------------------|--------------------------------------------------------------------|-------------------------|
| `ROLES_ENDPOINT`  | `http://localhost:8081/service/rest/v1/security/roles`             | Creating roles          |
| `USERS_ENDPOINT`  | `http://localhost:8081/service/rest/v1/security/users`             | Creating users          |

The admin `user` and `password` are currently hard-coded in `src/env.js`; change
them to match your NXRM instance before running anything against a real server.

## Authentication
All requests use **HTTP Basic Authentication**. The account must have permission
to administer security (the built-in `admin` account does, by default).

`superagent`'s `.auth(user, password)` call sets the standard header:

```
Authorization: Basic <base64(user:password)>
Content-Type: application/json
Accept: application/json
```

For example, with the default `admin:potatoes` credentials:

```
Authorization: Basic YWRtaW46cG90YXRvZXM=
```

Rotate the credentials by editing `src/env.js` (or by replacing the hard-coded
values with `process.env.*` lookups).

## Four-step workflow
This project is built around the workflow described in Sonatype's
["Four Steps to Get Started with Nexus Repo Using New REST APIs"](https://www.sonatype.com/blog/four-steps-to-get-started-with-nexus-repo-using-new-rest-apis):

1. Create a blobstore
2. Create a repository (e.g. `ny-maven-internal`)
3. Create a role that grants read/write on that repository
4. Create a user and assign the role from step 3

Steps 1 and 2 are typically handled with a Groovy provisioning script. Steps 3
and 4 are what the scripts in this repo automate.

## Endpoints

| Method | Path                                  | Purpose                          | Implemented in this repo |
|--------|---------------------------------------|----------------------------------|--------------------------|
| `POST` | `/service/rest/v1/security/roles`     | Create a role                    | Yes — `createRole`       |
| `POST` | `/service/rest/v1/security/users`     | Create a user                    | Stubbed — `createUser`   |

NXRM also exposes `GET`, `PUT`, and `DELETE` on these resources; only `POST` is
wired up here.

## Create a role

`POST /service/rest/v1/security/roles`

### Headers
| Header          | Value                            | Required |
|-----------------|----------------------------------|----------|
| `Authorization` | `Basic <base64(user:password)>`  | Yes      |
| `Content-Type`  | `application/json`               | Yes      |

### Body parameters
Shape enforced by the [`Role`](src/models/role.js) class.

| Field         | Type       | Required | Description                                                   |
|---------------|------------|----------|---------------------------------------------------------------|
| `id`          | `string`   | Yes      | Unique role identifier (used to reference the role later).    |
| `name`        | `string`   | Yes      | Human-readable name shown in the NXRM UI.                     |
| `description` | `string`   | No       | Free-text description of the role's purpose.                  |
| `privileges`  | `string[]` | Yes      | Privilege IDs granted to the role (e.g. `nx-repository-view-maven2-<repo>-read`). |

### Request example
```http
POST /service/rest/v1/security/roles HTTP/1.1
Host: localhost:8081
Authorization: Basic YWRtaW46cG90YXRvZXM=
Content-Type: application/json

{
  "id": "ny-dev-role",
  "name": "NY Developer",
  "description": "Read/write on ny-maven-internal",
  "privileges": [
    "nx-repository-view-maven2-ny-maven-internal-read",
    "nx-repository-view-maven2-ny-maven-internal-add",
    "nx-repository-view-maven2-ny-maven-internal-edit"
  ]
}
```

### Response example
`200 OK`
```json
{
  "id": "ny-dev-role",
  "source": "default",
  "name": "NY Developer",
  "description": "Read/write on ny-maven-internal",
  "readOnly": false,
  "privileges": [
    "nx-repository-view-maven2-ny-maven-internal-read",
    "nx-repository-view-maven2-ny-maven-internal-add",
    "nx-repository-view-maven2-ny-maven-internal-edit"
  ],
  "roles": []
}
```

## Create a user

`POST /service/rest/v1/security/users`

### Headers
Same as for roles: `Authorization` + `Content-Type: application/json`.

### Body parameters
Shape enforced by the [`User`](src/models/user.js) class.

| Field          | Type       | Required | Description                                                |
|----------------|------------|----------|------------------------------------------------------------|
| `userId`       | `string`   | Yes      | Unique login identifier.                                   |
| `firstName`    | `string`   | Yes      | User's first name.                                         |
| `lastName`     | `string`   | Yes      | User's last name.                                          |
| `emailAddress` | `string`   | Yes      | Contact email.                                             |
| `password`     | `string`   | Yes      | Initial password. Only sent on create; never returned.     |
| `status`       | `string`   | Yes      | `active`, `locked`, `disabled`, or `changepassword`.       |
| `roles`        | `string[]` | Yes      | Role IDs to assign (e.g. `["ny-dev-role"]`).               |

### Request example
```http
POST /service/rest/v1/security/users HTTP/1.1
Host: localhost:8081
Authorization: Basic YWRtaW46cG90YXRvZXM=
Content-Type: application/json

{
  "userId": "jdoe",
  "firstName": "Jane",
  "lastName": "Doe",
  "emailAddress": "jdoe@example.com",
  "password": "changeme",
  "status": "active",
  "roles": ["ny-dev-role"]
}
```

### Response example
`200 OK`
```json
{
  "userId": "jdoe",
  "firstName": "Jane",
  "lastName": "Doe",
  "emailAddress": "jdoe@example.com",
  "source": "default",
  "status": "active",
  "readOnly": false,
  "roles": ["ny-dev-role"],
  "externalRoles": []
}
```

## Errors
NXRM returns standard HTTP status codes. The most common ones you'll see from
the scripts in this repo:

| Status                      | Meaning                                | Typical cause                                                   |
|-----------------------------|----------------------------------------|-----------------------------------------------------------------|
| `400 Bad Request`           | Validation error                       | Missing required field, malformed JSON, unknown privilege ID.   |
| `401 Unauthorized`          | Authentication failed                  | Wrong username/password or missing `Authorization` header.      |
| `403 Forbidden`             | Authenticated but not allowed          | Account lacks the `nx-all` (or equivalent) privilege.           |
| `404 Not Found`             | Endpoint not found                     | Wrong URL, NXRM REST API disabled, or version mismatch.         |
| `409 Conflict` *            | Resource already exists                | A role/user with the same `id`/`userId` is already provisioned. |
| `500 Internal Server Error` | Server-side failure                    | Unexpected NXRM error — check the NXRM server logs.             |

\* Some NXRM versions surface duplicates as `400` rather than `409` — check the
response body for the exact message.

The error body is JSON with details about each invalid field, e.g.:

```json
[
  {
    "id": "*",
    "message": "A role with the same id already exists."
  }
]
```

In [`src/index.js`](src/index.js) errors are surfaced via
`console.log(e.response.body)` so this payload is what you'll see in the
terminal.

## Usage

### Creating roles
[`src/index.js`](src/index.js) reads an array of role definitions from
`data.json` (at the repository root) and POSTs each one to the roles endpoint
in parallel via `Promise.all`:

```sh
node src/index.js
```

A minimal `data.json` looks like:
```json
[
  {
    "id": "ny-dev-role",
    "name": "NY Developer",
    "description": "Read/write on ny-maven-internal",
    "privileges": [
      "nx-repository-view-maven2-ny-maven-internal-read",
      "nx-repository-view-maven2-ny-maven-internal-add",
      "nx-repository-view-maven2-ny-maven-internal-edit"
    ]
  }
]
```

### Creating users
A commented-out `createUser` stub in
[`src/services/index.js`](src/services/index.js) shows the pattern — uncomment
it, import the `User` model, and call it from `src/index.js` the same way
`createRole` is used.

## Project layout
```
src/
  index.js            entry point — bulk-creates roles from data.json
  env.js              endpoints + admin credentials
  models/
    role.js           Role payload shape
    user.js           User payload shape
  services/
    index.js          createRole (and stubbed createUser) via superagent
learning-materials/
  promises.js         standalone Promise practice snippets
```

## Purpose
I'm using this to provision NXRM for demo purposes, and to practice —
feverishly — so that I can acquire ["the glow"](https://www.youtube.com/watch?v=6CkrEpYmBIQ).

## References
* [Superagent](https://github.com/forwardemail/superagent)
* [Four Steps to Get Started with Nexus Repo Using New REST APIs](https://www.sonatype.com/blog/four-steps-to-get-started-with-nexus-repo-using-new-rest-apis)
* [NXRM REST API reference](https://help.sonatype.com/repomanager3/integrations/rest-and-integration-api)

## Goodbye!

See you later!
