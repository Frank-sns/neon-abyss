import random

print("欢迎体验数字游戏！")
print("我想到了一个1到10之间的数字，你来猜吧！")

secret_number = random.randint(1,10)

while True:
    guess = int(input("请输入你的猜测(1-10):"))

    if guess == secret_number:
        print("恭喜你，猜对了！")
        break
    elif guess < secret_number:
        print("太小了，再试试！")
        break
    else:
        print("太大了，再试试！")

print("游戏结束，谢谢参与！")