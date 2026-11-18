import sys
src, out, maxlen = sys.argv[1], sys.argv[2], int(sys.argv[3])
words = set(w.strip() for w in open(src) if w.strip())
words |= {"qi","za","ki","oi","fe","ka","ok","ew","ze","qat","qis","zas"}
words = sorted(w for w in words if 2 <= len(w) <= maxlen and w.isalpha())
parts=[]; prev=""
for w in words:
    p=0
    while p<len(prev) and p<len(w) and prev[p]==w[p] and p<9: p+=1
    parts.append(str(p)+w[p:]); prev=w
s="".join(parts)
open(out,"w").write(s)
print(len(words), len(s))
