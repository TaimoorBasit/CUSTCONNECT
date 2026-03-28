const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');
c = c.replace(/,\s*map:\s*"[^"]+"/g, '');
fs.writeFileSync('prisma/schema.prisma', c);
