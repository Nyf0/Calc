import re

def tokenize(expr):
    tokens = re.findall(r'\d+|\+|\-|\*|\/|\(|\)', expr)
    return tokens

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None
    
    def eat(self, token=None):
        current = self.peek()

        if token and current != token:
            raise ValueError(f"Expected {token}, got {current}!")
        
        self.pos += 1
        return current
    
    def factor(self):
        token = self.peek()
        if token is None:
            raise ValueError("Unexpected end")
        
        if token.isdigit(): # if token is digit
            self.eat()
            return int(token)
        elif token == '(':  # if token is an enclosed expression
            self.eat('(')
            result = self.expr()
            self.eat(')')
            return result
        elif token == '-':  # if token is unary minus
            self.eat('-')
            return -self.factor()
        else:
            raise ValueError(f"Unexpected token: {token}")

    def term(self):
        result = self.factor()
        while self.peek() in ('*', '/'): # check if current token is either multiplication or division operator
            op = self.eat()
            if op == '*':
                result *= self.factor()
            elif op == '/':
                result /= self.factor()
            
        return result

    def expr(self):
        result = self.term()
        while self.peek() in ('+', '-'): # check if current token is either addition or subtraction operator
            op = self.eat()
            if op == '+':
                result += self.term()
            elif op == '-':
                result -= self.term()

        return result
    
def eval(expression):       # Eval function
    tokens = tokenize(expression)
    parser = Parser(tokens)
    return parser.expr()

if __name__ == "__main__":    
    exit = False
    while exit is False:
        expr = input("Enter input expression(enter 'exit' to quit): ").lower()
        
        if expr == "exit": # Exit code
            exit = True
            continue

        result = eval(expr)
        print(f"Answer is: {result}")
    