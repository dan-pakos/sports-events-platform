# Sports Events Platform

Sports Events Platform

## Architecture

## Setup

### Prerequisites

- [Make](https://www.gnu.org/software/make/)
- [Docker](https://www.docker.com/)

### Running development

Run the following from the root directory to bootstrap development mode:

```bash
make dev
```

### Loading example data

To seed database with example data run the following with default container name (sep-events-service):

```bash
 docker exec -it sep-events-service //bin/bash -c "cd services/events-service && pnpx prisma db seed"
```
