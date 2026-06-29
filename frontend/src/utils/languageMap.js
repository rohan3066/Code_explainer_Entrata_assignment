export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: '.js', monaco: 'javascript' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts', monaco: 'typescript' },
  { id: 'python', name: 'Python', extension: '.py', monaco: 'python' },
  { id: 'java', name: 'Java', extension: '.java', monaco: 'java' },
  { id: 'cpp', name: 'C++', extension: '.cpp', monaco: 'cpp' },
  { id: 'c', name: 'C', extension: '.c', monaco: 'c' },
  { id: 'go', name: 'Go', extension: '.go', monaco: 'go' },
  { id: 'rust', name: 'Rust', extension: '.rs', monaco: 'rust' },
  { id: 'php', name: 'PHP', extension: '.php', monaco: 'php' },
  { id: 'kotlin', name: 'Kotlin', extension: '.kt', monaco: 'kotlin' },
  { id: 'swift', name: 'Swift', extension: '.swift', monaco: 'swift' },
  { id: 'csharp', name: 'C#', extension: '.cs', monaco: 'csharp' },
  { id: 'html', name: 'HTML', extension: '.html', monaco: 'html' },
  { id: 'css', name: 'CSS', extension: '.css', monaco: 'css' },
  { id: 'sql', name: 'SQL', extension: '.sql', monaco: 'sql' },
];

export const getLanguageTemplate = (langId) => {
  switch (langId) {
    case 'javascript':
      return `// JavaScript code goes here\nfunction sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(5, 10));`;
    case 'typescript':
      return `// TypeScript code goes here\ninterface User {\n  id: number;\n  name: string;\n}\n\nfunction greet(user: User): string {\n  return \`Hello, \${user.name}!\`;\n}`;
    case 'python':
      return `# Python code goes here\ndef greet(name):\n    print(f"Hello, {name}!")\n\ngreet("Developer")`;
    case 'java':
      return `// Java code goes here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`;
    case 'cpp':
      return `// C++ code goes here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`;
    case 'c':
      return `// C code goes here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`;
    case 'go':
      return `// Go code goes here\npackage main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`;
    case 'rust':
      return `// Rust code goes here\nfn main() {\n    println!("Hello, World!");\n}`;
    case 'php':
      return `<?php\n// PHP code goes here\nfunction greet($name) {\n    return "Hello, " . $name;\n}\n\necho greet("World");`;
    case 'kotlin':
      return `// Kotlin code goes here\nfun main() {\n    println("Hello, World!")\n}`;
    case 'swift':
      return `// Swift code goes here\nimport Foundation\n\nfunc greet(name: String) {\n    print("Hello, \\(name)!")\n}\n\ngreet(name: "World")`;
    case 'csharp':
      return `// C# code goes here\nusing System;\n\nnamespace HelloWorld {\n    class Program {\n        static void Main(string[] args) {\n            Console.WriteLine("Hello, World!");\n        }\n    }\n}`;
    case 'html':
      return `<!-- HTML code goes here -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Page Title</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>`;
    case 'css':
      return `/* CSS code goes here */\nbody {\n    background-color: #f0f2f5;\n    font-family: Arial, sans-serif;\n}\nh1 {\n    color: #333333;\n}`;
    case 'sql':
      return `-- SQL queries go here\nSELECT * FROM users\nWHERE age > 18\nORDER BY created_at DESC;`;
    default:
      return `// Type code here`;
  }
};
