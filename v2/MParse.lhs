> module MParse where 

 import Control.Monad as C

> import Data.Char

> import qualified Prelude as P

newtype Parser a = Parser {parse :: P.String -> [(a, P.String)]}

> newtype Parser a = Parser (P.String -> [(a,P.String)])


Consumes the 1st character if input P.String is non-empty, and fails otherwise

> item :: Parser Char
> item = Parser (\cs -> case cs of 
>                              ""     -> []
>                              (c:cs) -> [(c,cs)]) 


Declaration of the monad class equipped with ret and (>>=) functions

Built in monad class:

> class MyMonad m where
>   ret :: a -> m a
>   (=>>)  :: m a -> (a -> m b) -> m b


Parser rets a without consuming any character of the argument P.String and rets single value of a.

> parse (Parser p) = p

instance Monad Parser where
    ret a = Parser (\cs -> [(a,cs)])
    p >>= f = Parser (\cs -> concat [parse (f a) cs' |
                            (a,cs') <- parse p cs])

> instance MyMonad Parser where   
>   ret a = Parser (\cs -> [(a, cs)]) 
>   p =>> f = Parser (\cs -> P.concat [parse (f a) cs' | (a, cs') <- parse p cs])  

> class MyMonad m => MyMonadZero m where
>   zero :: m a

> class MyMonadZero m => MyMonadPlus m where
>   (<+>) :: m a -> m a -> m a

> instance MyMonadZero Parser where
>   zero = Parser (\cs -> [])

> instance MyMonadPlus Parser where
>  p <+> q = Parser (\cs -> case (parse p cs P.++ parse q cs) of
>                            []     -> []
>                            (x:xs) -> [x])

> (<|>) :: Parser a -> Parser a -> Parser a 
> p <|> q = p <+> q

> (->>) :: Parser a -> Parser b -> Parser b
> p ->> q = p =>> \_ -> q

 sat :: (Char -> P.Bool) -> Parser Char
 sat p = do {c <- item; if p c then ret c else zero}

> sat :: (Char -> P.Bool) -> Parser Char
> sat p = item =>> \c -> if p c then ret c else zero

> char :: Char -> Parser Char
> char c = sat (c P.==)

 string :: P.String -> Parser P.String
 string ""     = ret ""
 string (c:cs) = do{char c; string cs; ret (c:cs)}

> string :: P.String -> Parser P.String
> string ""     = ret ""
> string (c:cs) = char c =>> \_ -> string cs =>> \_ -> ret (c:cs)

> many :: Parser a -> Parser [a]
> many p = many1 p <|> ret []

 many1 :: Parser a -> Parser [a]
 many1 p = do{a <- p; as <- many p; ret (a:as)}

> many1 :: Parser a -> Parser [a]
> many1 p = p =>> \a -> many p =>> \as -> ret (a:as)

> sepby :: Parser a -> Parser b -> Parser [a]
> p `sepby` sep = (p `sepby1` sep) <|> ret []

sepby1 :: Parser a -> Parser b -> Parser [a]
   p `sepby1` sep = do a <- p
   as <- many (do {sep; p})
         ret (a:as)

 sepby1 :: Parser a -> Parser b -> Parser [a]
 p `sepby1` sep = do {a <- p; as <- many (do{sep; p}); ret (a:as)}

> sepby1 :: Parser a -> Parser b -> Parser [a]
> p `sepby1` sep = p =>> \a -> many (sep ->> p) =>> \as -> ret (a:as)

chainl :: Parser a -> Parser (a -> a -> a) -> a -> Parser a
chainl p op a = (p `chainl1` op) <|> ret a

> chainl :: Parser a -> Parser (a -> a -> a) -> a -> Parser a
> chainl p op a = (p `chainl1` op) <|> ret a

chainl1 :: Parser a -> Parser (a -> a -> a) -> Parser a
p `chainl1` op = do {a <- p; rest a}
   where
      rest a = (do f <- op
      b <- p
      rest (f a b))
      <|> ret a

> chainl1 :: Parser a -> Parser (a -> a -> a) -> Parser a
> p `chainl1` op = p =>> \a -> rest a
>   where
>     rest a =
>       (op =>> \f ->
>        p =>> \b ->
>        rest (f a b))
>       <|> ret a

Parse a string of spaces, tabs, and newlines:

> space :: Parser P.String
> space = many (sat isSpace)

Parse a token using a parser p, throwing away any trailing space:

 token :: Parser a -> Parser a
 token p = do {a <- p; space; ret a}

> token :: Parser a -> Parser a
> token p = space =>> \_ -> p =>> \a -> space =>> \_ -> ret a

Parse a symbolic token:

> symb :: P.String -> Parser P.String
> symb cs = token (string cs)

Apply a parser p, throwing away any leading space:

 apply :: Parser a -> P.String -> [(a,P.String)]
 apply p = parse (do {space; p})

> apply :: Parser a -> P.String -> [(a,P.String)]
> apply p = parse (space =>> \_ -> p)



