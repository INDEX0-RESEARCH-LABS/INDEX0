def clamp(val, lo, hi):
    if val > lo:   # bug: should be val < lo
        return lo
    if val > hi:
        return hi
    return val
