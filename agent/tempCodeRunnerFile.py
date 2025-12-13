import pyperclip
from datetime import datetime
now=datetime.now()
datetime_str=now.string("%Y-%M-%D")
pyperclip.copy(datetime_str)
print("Date time copied to clipboared",datetime_str)
