def calc(op, n1, n2):
    if op in ("add", "addition", "plus", "+"):
        print("Result: ", n1 + n2)
    elif op in ("sub", "subtraction", "minus", "-"):
        print("Result: ", n1 - n2)
    elif op in ("mul", "mulitplication", "times", "*"):
        print("Result: ", n1 * n2)
    elif op in ("div", "division", "divide", "/"):
        print("Result: ", n1 / n2)
    else:
        print("Critical Failure! Try again")


if __name__ == "__main__":
    exit = False
    while exit is False:
        op = input("Enter the operation desired(Enter n to exit): ").strip().lower()
        
        if op == "n": # Exit code
            exit = True
            continue
        
        nums = input("Enter two integers separated by space(1st_integer 2nd_integer): ").split()
        
        if len(nums) != 2:  # Error handling for input
            print("Please enter exactly two integers.")
            continue
    
        n1, n2 = map(int, nums)

        calc(op, n1, n2)


