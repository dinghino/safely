# Convex lib

Module contains helper functions, custom components (when available) and internal
functions to make code a bit more dry and readable.

`lib` should be divided in folders representing resource or functionality and
scoped in files.

Functions should take the correct convex context type, any extra parameter needed
and used explicitly in the query/mutation handlers at the root.
