#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Get the relevant spec for a given file
function findRelevantSpec(file) {
  const configPath = path.join(process.cwd(), 'spec.config.json');
  
  if (!fs.existsSync(configPath)) {
    console.warn('No spec.config.json found, using default settings');
    return null;
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const specDir = config.specDir || '.spec';
  
  // Simple heuristic: look for specs with similar names
  const baseName = path.basename(file, path.extname(file)).toLowerCase();
  
  // Check in features directory
  const featuresDir = path.join(process.cwd(), specDir, 'features');
  if (fs.existsSync(featuresDir)) {
    const featureSpecs = fs.readdirSync(featuresDir);
    
    for (const spec of featureSpecs) {
      if (spec.toLowerCase().includes(baseName) || 
          baseName.includes(spec.toLowerCase().replace('.md', ''))) {
        return path.join(featuresDir, spec);
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
        return path.join(apiDir, spec);
      }
    }
  }
  
  return null;
}

// Calculate a simple match score between file and spec
function calculateScore(file, specFile) {
  if (!specFile || !fs.existsSync(specFile)) {
    return 0;
  }
  
  // Basic implementation - just checks for keyword overlap
  // In a real implementation, this would use an LLM to calculate semantic similarity
  const fileContent = fs.readFileSync(file, 'utf8');
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
  
  // Calculate percentage match
  const maxPossible = Math.min(fileWords.size, specWords.size);
  return maxPossible > 0 ? matches / maxPossible : 0;
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
    const specFile = findRelevantSpec(file);
    const score = calculateScore(file, specFile);
    fileCount++;
    totalScore += score;
    
    console.log(`${file} -> ${specFile || 'No matching spec'}: Score ${(score * 100).toFixed(1)}%`);
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
    return 1;
  } else {
    console.log('✅ Spec alignment score meets threshold.');
    return 0;
  }
}

// Run the main function and set exit code
process.exit(main()); 