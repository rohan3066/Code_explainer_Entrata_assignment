/**
 * Detects the programming language of a code snippet using simple heuristic matching.
 * Supported: python, java, cpp, c, javascript, typescript, go, rust, php, kotlin, swift, csharp, html, css, sql.
 */
function detectLanguage(code) {
  if (!code || typeof code !== 'string') return 'javascript';
  
  const trimmed = code.trim();
  
  // HTML Check
  if (trimmed.startsWith('<!DOCTYPE html>') || (trimmed.includes('<html') && trimmed.includes('</html>'))) {
    return 'html';
  }
  
  // CSS Check
  if (trimmed.includes('body {') || trimmed.includes('@media') || (trimmed.includes('{') && trimmed.includes(':') && trimmed.includes(';') && (trimmed.includes('color:') || trimmed.includes('margin:')))) {
    // Make sure it's not JS
    if (!trimmed.includes('const ') && !trimmed.includes('function ') && !trimmed.includes('let ')) {
      return 'css';
    }
  }

  // SQL Check
  const sqlKeywords = ['SELECT ', 'INSERT INTO', 'UPDATE ', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'JOIN ', 'WHERE '];
  if (sqlKeywords.some(keyword => trimmed.toUpperCase().includes(keyword))) {
    // If it has heavy JS symbols, let's keep it JS, otherwise if SQL keywords are prominent
    const sqlCount = sqlKeywords.filter(k => trimmed.toUpperCase().includes(k)).length;
    if (sqlCount >= 2 && !trimmed.includes('const ') && !trimmed.includes('function ')) {
      return 'sql';
    }
  }

  // C++ vs C vs C#
  if (trimmed.includes('#include <iostream>') || trimmed.includes('using namespace std;') || trimmed.includes('std::cout')) {
    return 'cpp';
  }
  if (trimmed.includes('#include <stdio.h>') || trimmed.includes('#include <stdlib.h>') || (trimmed.includes('int main(') && trimmed.includes('printf('))) {
    return 'c';
  }
  if (trimmed.includes('using System;') || trimmed.includes('namespace ') && trimmed.includes('class ') && (trimmed.includes('Console.WriteLine') || trimmed.includes('public static void Main'))) {
    return 'csharp';
  }

  // Python Check
  if (trimmed.includes('def ') && trimmed.includes(':') && (trimmed.includes('import ') || trimmed.includes('print(') || trimmed.includes('self.'))) {
    return 'python';
  }
  if (trimmed.includes('import os') || trimmed.includes('import sys') || trimmed.includes('if __name__ ==') || trimmed.includes('elif ')) {
    return 'python';
  }

  // Java vs Kotlin vs Swift vs Go vs Rust
  if (trimmed.includes('public class ') && (trimmed.includes('public static void main') || trimmed.includes('System.out.print'))) {
    return 'java';
  }
  if (trimmed.includes('package main') && trimmed.includes('import (') && (trimmed.includes('func ') || trimmed.includes('fmt.'))) {
    return 'go';
  }
  if (trimmed.includes('fn main()') || (trimmed.includes('let mut ') && trimmed.includes('fn '))) {
    return 'rust';
  }
  if (trimmed.includes('fun main(') || (trimmed.includes('val ') && trimmed.includes('var ') && trimmed.includes('fun '))) {
    return 'kotlin';
  }
  if (trimmed.includes('import UIKit') || trimmed.includes('let ') && trimmed.includes('var ') && trimmed.includes('func ') && trimmed.includes('print(') && !trimmed.includes('const ') && !trimmed.includes(';')) {
    return 'swift';
  }

  // PHP Check
  if (trimmed.startsWith('<?php') || trimmed.includes('<?php') || trimmed.includes('echo $') || trimmed.includes('function ') && trimmed.includes('$this->')) {
    return 'php';
  }

  // TypeScript vs JavaScript
  if (trimmed.includes(': string') || trimmed.includes(': number') || trimmed.includes(': any') || trimmed.includes('interface ') || trimmed.includes('type ') || trimmed.includes('as ') && (trimmed.includes('const ') || trimmed.includes('let ') || trimmed.includes('function '))) {
    return 'typescript';
  }

  // Default javascript or python heuristics
  if (trimmed.includes('const ') || trimmed.includes('let ') || trimmed.includes('function ') || trimmed.includes('console.log')) {
    return 'javascript';
  }

  if (trimmed.includes('def ') || trimmed.includes('print ')) {
    return 'python';
  }

  return 'javascript'; // Default fallback
}

module.exports = detectLanguage;
