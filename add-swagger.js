const fs = require('fs');
const path = require('path');

const dir = './src/infra/http/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('controller.ts') && !f.includes('.spec'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Clean up duplicate imports first if we run multiple times
  if (content.includes('@ApiTags')) continue;
  
  if (!content.includes('@nestjs/swagger')) {
    content = "import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';\n" + content;
  } else {
    // If it exists, append to it (some files have ApiBody already)
    content = content.replace(/import {([^}]+)} from '@nestjs\/swagger';/, "import { ApiTags, ApiOperation, ApiResponse, $1 } from '@nestjs/swagger';");
  }
  
  let tagStr = file.replace('.controller.ts', '').split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
  
  // Fix nested controllers like `get-account-by-id` -> `Account` etc.
  if(tagStr.includes('Course')) tagStr = 'Courses';
  else if(tagStr.includes('Account') || tagStr.includes('Password')) tagStr = 'Accounts';
  else if(tagStr.includes('Rating')) tagStr = 'Ratings';
  else if(tagStr.includes('Fetch')) tagStr = 'Courses';
  
  // Add @ApiTags before @Controller
  content = content.replace(/@Controller\((.*?)\)/, `@ApiTags('${tagStr}')\n@Controller($1)`);
  
  // Find all Http verb decorators and add swagger after them
  // e2g @Post() -> @Post() @ApiOperation(...) @ApiResponse(...)
  content = content.replace(/@(Get|Post|Patch|Delete|Put)\((.*?)\)/g, `@$1($2)\n  @ApiOperation({ summary: 'Endpoint operation' })\n  @ApiResponse({ status: 200, description: 'Success' })\n  @ApiResponse({ status: 400, description: 'Bad Request' })`);
  
  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('Swagger added to all controllers');
