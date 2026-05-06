import re
with open('G:/projectopencod/igra1/js/danceAnimation.js', 'r') as f:
    c = f.read()
lines = re.findall(r"'([.\w]+)'", c)
for l in lines:
    if len(l) not in [12]:
        print("len=%d: %s" % (len(l), l))
print("Total sprite lines:", len(lines))
