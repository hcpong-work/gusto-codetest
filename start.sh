#!/bin/sh

npx prisma migrate dev
node dist/index.js