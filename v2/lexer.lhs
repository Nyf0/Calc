> import MParse

digit = '0' | '1' | '2' | '3' | .. | '9'

> isMember :: Char -> [Char] -> Bool
> isMember _ [] = False
> isMember c (x:xs)
>   | c == x    = True
>   | otherwise = isMember c xs

> isDigit :: Char -> Bool
> isDigit c = isMember c ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

> digit :: Parser Char
> digit = sat (isDigit)

> isLetter :: Char -> Bool
> isLetter c = isMember c (['a'..'z'] ++ ['A'..'Z'])

> letter :: Parser Char
> letter = sat (isLetter)

 isLower :: Char -> Bool
 isLower c = isMember c (['a'..'z'])

 lower :: Parser Char
 lower = sat (isLower)

 isAlphaNum :: Char -> Bool
 isAlphaNum c = (isDigit c) 
             <|> (isLower c)

 alphaNum :: Parser Char
 alphaNum = sat (isAlphaNum)

Grammar for natural numbers
---------------------------

nat = digit {digit}
  or
nat = digit+
  
nat = many1 digit

----------------
Sequential execution

p1 >>= \a1 ->
p2 >>= \a2 ->
...
pn >>= \an ->
f a1 a2 .. an

or

p1 >>= \a1 -> p2 >>= \a2 -> ... pn >>= \an -> f a1 a2 .. an

p1 >>= \a1.p2 >>= \a2.p3 >>= .. pn >>= \an.f a1 a2 .. an


(\a1.p2) p1

one :: Int

inc :: Int -> Int

Parser for natural number
-------------------------

> nat :: Parser Int
> nat  = many1 digit =>> \xs -> ret (read xs)

         do {xs <- many1 digit; ret (read xs)}

> natural :: Parser Int
> natural = token (nat)

Grammar for Arithmetic Expression
---------------------------------

expr ::= term '+' expr 
       | term '-' expr
       | term
       
term ::= factor '*' term
       | factor '*' term
       | factor
       
factor ::= '(' expr ')'
         | number
         | variable

number ::= nat

nat ::= digit {digit} # one or more digit (many1)

nat ::= digit+

variable ::= letter [letter | digit]

Parser for Arithmetic Expression
-----------------------------------

> type Ident = String

> data AExp
>      = Add AExp AExp
>      | Sub AExp AExp
>      | Mul AExp AExp
>      | Div AExp AExp
>      | Exp AExp AExp
>      | Num Int
>      | Var Ident
>      deriving Show

> expr :: Parser AExp

expr = do {t <- term; symb "+"; e <- expr; ret (Add t e)} 
   <|> do {t <- term; symb "-"; e <- expr; ret (Sub t e)}
   <|> term

> expr = (term =>> \t -> symb "+" =>> \_ -> expr =>> \e -> ret (Add t e)) 
>    <|> (term =>> \t -> symb "-" =>> \_ -> expr =>> \e -> ret (Sub t e))
>    <|> term

> term :: Parser AExp
> term = (factor =>> \f -> symb "*" =>> \_ -> term =>> \t -> ret (Mul f t)) 
>    <|> (factor =>> \f -> symb "/" =>> \_ -> term =>> \t -> ret (Div f t)) 
>    <|> factor

> factor :: Parser AExp
> factor = (symb "(" =>> \_ -> expr =>> \e -> symb ")" =>> \_ -> ret e) 
>             <|> (natural =>> \n -> ret (Num n))
>             <|> (variable =>> \v -> ret v)

> variable :: Parser AExp
> variable = identifier =>> \v -> ret (Var v)

 ident :: Parser AExp
 ident = do { x <- letter; xs <- many (letter <|> digit); ret (x:xs) }

> identifier :: Parser Ident
> identifier = letter =>> \x -> many (letter <|> digit) =>> \xs -> ret (x:xs)

> number :: Parser AExp
> number = natural =>> \n -> ret (Num n)

Parser function for expressions with strings as input.
Input: parse_expr "1 + 2"
Expected output: Add (Num 1) (Num 2)

> parse_expr :: String -> AExp
> parse_expr expstr = 
>   case parse expr expstr of
>     [(res,"")]  -> res
>     [(res,str)] -> error ("unused input: " ++ str)
>     []          -> error ("invalid input: " ++ expstr)


1 + 2 + 3 + 4

5 * 4 * 6 * ..

5 - 3 - 5 - 7 

> eval_aexpr :: AExp -> Int
> eval_aexpr (Num n)     = n
> eval_aexpr (Add e1 e2) = eval_aexpr e1 + eval_aexpr e2
> eval_aexpr (Sub e1 e2) = eval_aexpr e1 - eval_aexpr e2
> eval_aexpr (Mul e1 e2) = eval_aexpr e1 * eval_aexpr e2

> calc :: String -> Int
> calc = eval_aexpr . parse_expr




||||||||||||||||||||||||||||||||||
 expr :: Parser P.Int
 expr   = term `chainl1` addop
 term   = factor `chainl1` mulop
 factor = digit <|> do {symb "("; n <- expr; symb ")"; ret n}
 digit  = do {x <- token (sat isDigit); ret (ord x P.- ord '0')}
-----------------------------------

 addop :: Parser (Int -> Int -> Int)
 addop = (symb "+" ->> ret (+)) <|> (symb "-" ->> ret (-))

 mulop :: Parser (Int -> Int -> Int)
 mulop = (symb "*" ->> ret (*)) <|> (symb "/" ->> ret (div))

 expr :: Parser Int
 expr = term `chainl1` addop
 term   = factor `chainl1` mulop   

 factor :: Parser Int
 factor = number <|> (symb "(" ->> expr =>> \n -> symb ")" ->> ret n)

 number :: Parser Int
 number = natural =>> \n -> ret n

 addexpr :: Parser Int
 addexpr = operand `chainl1` opadd

 operand :: Parser Int
 operand = number =>> \n -> ret n

 opadd = symb "+" ->> ret (+)

|||||||||||||||||||||||||||||||||||