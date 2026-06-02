def date_only(value):
    if isinstance(value, str) and 'T' in value:
        return value.split('T', 1)[0]
    return value
