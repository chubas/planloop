#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const glob = require('glob');

// Get changed files from git
function getChangedFiles() {
  try {
    const output = execSync('git diff --cached --name-only').toString().trim();
    return output ? output.split('\n') : [];
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

// Extract YAML frontmatter from markdown file
function extractFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    
    if (match && match[1]) {
      try {
        return yaml.load(match[1]);
      } catch (e) {
        console.warn(`Error parsing frontmatter in ${filePath}: ${e.message}`);
        return {};
      }
    }
    return {};
  } catch (error) {
    console.warn(`Error reading file ${filePath}: ${error.message}`);
    return {};
  }
}

// Find relevant specs for a given file based on metadata
function findRelevantSpecs(file) {
  const configPath = path.join(process.cwd(), 'spec.config.json');
  
  if (!fs.existsSync(configPath)) {
    console.warn('No spec.config.json found, using default settings');
    return [];
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const specDir = config.specDir || '.spec';
  const relevantSpecs = [];
  
  // First, check for direct file references in spec metadata
  function scanDirectory(directory) {
    if (!fs.existsSync(directory)) return;
    
    const files = fs.readdirSync(directory);
    for (const specFile of files) {
      const specPath = path.join(directory, specFile);
      
      if (fs.statSync(specPath).isDirectory()) {
        scanDirectory(specPath);
        continue;
      }
      
      if (path.extname(specFile) !== '.md') continue;
      
      const metadata = extractFrontmatter(specPath);
      if (!metadata.relevant_files) continue;
      
      // Check direct file matches
      if (metadata.relevant_files.includes(file)) {
        relevantSpecs.push(specPath);
        continue;
      }
      
      // Check directory matches
      for (const pattern of metadata.relevant_files) {
        // If pattern ends with /, it's a directory pattern
        if (pattern.endsWith('/') && file.startsWith(pattern)) {
          relevantSpecs.push(specPath);
          break;
        }
        
        // Try as glob pattern
        if (pattern.includes('*')) {
          try {
            const matches = glob.sync(pattern, { cwd: process.cwd() });
            if (matches.includes(file)) {
              relevantSpecs.push(specPath);
              break;
            }
          } catch (e) {
            // Ignore glob errors
          }
        }
      }
    }
  }
  
  // Scan all spec directories
  scanDirectory(path.join(process.cwd(), specDir, 'features'));
  scanDirectory(path.join(process.cwd(), specDir, 'api'));
  
  // If no specs found through metadata, fall back to name-based matching
  if (relevantSpecs.length === 0) {
    // Simple heuristic: look for specs with similar names
    const baseName = path.basename(file, path.extname(file)).toLowerCase();
    
    // Check in features directory
    const featuresDir = path.join(process.cwd(), specDir, 'features');
    if (fs.existsSync(featuresDir)) {
      const featureSpecs = fs.readdirSync(featuresDir);
      
      for (const spec of featureSpecs) {
        if (spec.toLowerCase().includes(baseName) || 
            baseName.includes(spec.toLowerCase().replace('.md', ''))) {
          relevantSpecs.push(path.join(featuresDir, spec));
        }
      }
    }
    
    // Check in api directory
    const apiDir = path.join(process.cwd(), specDir, 'api');
    if (fs.existsSync(apiDir)) {
      const apiSpecs = fs.readdirSync(apiDir);
      
      for (const spec of apiSpecs) {
        if (spec.toLowerCase().includes(baseName) || 
            baseName.includes(spec.toLowerCase().replace('.md', ''))) {
          relevantSpecs.push(path.join(apiDir, spec));
        }
      }
    }
  }
  
  return relevantSpecs;
}

// Calculate a match score between file and specs
function calculateScore(file, specFiles) {
  if (!specFiles || specFiles.length === 0) {
    return 0;
  }
  
  // Read the file content
  const fileContent = fs.readFileSync(file, 'utf8');
  
  // Process each spec and calculate combined score
  let totalScore = 0;
  for (const specFile of specFiles) {
    const specContent = fs.readFileSync(specFile, 'utf8');
    
    // Extract important words from both (excluding common code terms)
    const fileWords = new Set(fileContent.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3));
    const specWords = new Set(specContent.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3));
    
    // Count matches
    let matches = 0;
    for (const word of fileWords) {
      if (specWords.has(word)) {
        matches++;
      }
    }
    
    // Calculate percentage match for this spec
    const maxPossible = Math.min(fileWords.size, specWords.size);
    const specScore = maxPossible > 0 ? matches / maxPossible : 0;
    totalScore += specScore;
  }
  
  // Calculate average score across all specs
  return totalScore / specFiles.length;
}

// Main function
function main() {
  const changedFiles = getChangedFiles().filter(file => {
    // Ignore spec files themselves, package files, and certain directories
    return !file.startsWith('.spec/') && 
           !file.includes('package.json') &&
           !file.startsWith('.git/') &&
           fs.existsSync(file);
  });
  
  if (changedFiles.length === 0) {
    console.log('No relevant changed files to check.');
    return 0;
  }
  
  console.log('🔍 Checking spec alignment for changed files...');
  
  let totalScore = 0;
  let fileCount = 0;
  
  for (const file of changedFiles) {
    const specFiles = findRelevantSpecs(file);
    const score = calculateScore(file, specFiles);
    fileCount++;
    totalScore += score;
    
    console.log(`${file} -> ${specFiles.length > 0 ? specFiles.join(', ') : 'No matching specs'}: Score ${(score * 100).toFixed(1)}%`);
  }
  
  const averageScore = totalScore / fileCount;
  console.log(`\nOverall alignment score: ${(averageScore * 100).toFixed(1)}%`);
  
  // Read config to get minimum required score
  const configPath = path.join(process.cwd(), 'spec.config.json');
  let minimumScore = 0.6; // Default
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    minimumScore = config.validation?.minimumScore || minimumScore;
  }
  
  console.log(`Minimum required score: ${(minimumScore * 100).toFixed(1)}%`);
  
  if (averageScore < minimumScore) {
    console.error('❌ Spec alignment score below threshold.');
    console.log('Consider:');
    console.log('1. Updating relevant specs to match your changes');
    console.log('2. Creating new specs for new functionality');
    console.log('3. Adding more detailed descriptions in your specs');
    console.log('4. Updating relevant_files metadata in specs to include the changed files');
    return 1;
  } else {
    console.log('✅ Spec alignment score meets threshold.');
    return 0;
  }
}

// Run the main function and set exit code
process.exit(main()); 