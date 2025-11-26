import re


class AutocompleteService:
    """
    Mocked AI autocomplete service.
    In a real implementation, this would integrate with ML models or language servers.
    """
    
    def __init__(self):
        # Simple rule-based suggestions
        self.python_suggestions = {
            "def ": "function_name(param1, param2):\n    pass",
            "class ": "ClassName:\n    def __init__(self):\n        pass",
            "if ": "condition:\n    # code here",
            "for ": "item in iterable:\n    # code here",
            "while ": "condition:\n    # code here",
            "import ": "numpy as np",
            "from ": "module import something",
            "try:": "\n    # code that might raise exception\nexcept Exception as e:\n    # handle exception",
            "with ": "open('file.txt', 'r') as f:\n    content = f.read()",
            "print(": "\"Hello, World!\")",
            "return ": "result",
        }
        
        self.javascript_suggestions = {
            "function ": "functionName(param1, param2) {\n    // code here\n}",
            "const ": "variableName = value;",
            "let ": "variableName = value;",
            "if (": "condition) {\n    // code here\n}",
            "for (": "let i = 0; i < length; i++) {\n    // code here\n}",
            "console.": "log('message');",
            "import ": "{ something } from 'module';",
            "export ": "default Component;",
            "async ": "function asyncFunction() {\n    await something();\n}",
            "try {": "\n    // code that might throw\n} catch (error) {\n    // handle error\n}",
        }
    
    def get_suggestion(self, code: str, cursor_position: int, language: str) -> dict:
        """
        Generate a mocked autocomplete suggestion based on code context.
        """
        # Extract text before cursor
        text_before_cursor = code[:cursor_position]
        
        # Get last line
        lines = text_before_cursor.split('\n')
        current_line = lines[-1] if lines else ""
        
        # Choose suggestion set based on language
        if language == "python":
            suggestions = self.python_suggestions
        elif language in ["javascript", "typescript"]:
            suggestions = self.javascript_suggestions
        else:
            suggestions = self.python_suggestions  # default
        
        # Try to find matching pattern
        suggestion_text = ""
        confidence = 0.0
        
        for pattern, completion in suggestions.items():
            if current_line.strip().endswith(pattern.strip()):
                suggestion_text = completion
                confidence = 0.85
                break
            elif pattern.lower() in current_line.lower():
                suggestion_text = completion
                confidence = 0.60
                break
        
        # Fallback suggestions based on common patterns
        if not suggestion_text:
            if language == "python":
                if "def" in current_line:
                    suggestion_text = "function_name():"
                    confidence = 0.50
                elif "class" in current_line:
                    suggestion_text = "ClassName:"
                    confidence = 0.50
                elif current_line.strip().endswith("="):
                    suggestion_text = " None"
                    confidence = 0.40
                elif re.search(r'\w+\($', current_line):
                    suggestion_text = ")"
                    confidence = 0.70
                else:
                    suggestion_text = "pass"
                    confidence = 0.30
            else:
                if "function" in current_line:
                    suggestion_text = "functionName() {}"
                    confidence = 0.50
                elif current_line.strip().endswith("="):
                    suggestion_text = " null;"
                    confidence = 0.40
                else:
                    suggestion_text = "// TODO: implement"
                    confidence = 0.30
        
        return {
            "text": suggestion_text,
            "confidence": confidence
        }
    
    def get_contextual_suggestions(self, code: str, language: str) -> list:
        """
        Get multiple suggestions based on entire code context.
        This is an advanced feature that could be implemented.
        """
        # This could analyze imports, defined functions, variables, etc.
        # For now, return empty list as it's beyond the basic requirement
        return []
