<!-- To format this file, you need to use a hacked version of Markdown that ignores MathJax sections containing in $...$ and $$...$$ delimiters. -->

<div style='display:none'>
$$
\newcommand{\pd}[2]{\frac{\partial#1}{\partial#2}}
\newcommand{\C}{\boldsymbol C}
\newcommand{\b}{\boldsymbol b}
\newcommand{\c}{\boldsymbol c}
\newcommand{\p}{\boldsymbol p}
\newcommand{\V}{\boldsymbol V}
\newcommand{\X}{\boldsymbol X}
\newcommand{\Y}{\boldsymbol Y}
\newcommand{\vh}{\boldsymbol{\hat{v}}}
\newcommand{\xh}{\boldsymbol{\hat{x}}}
\newcommand{\yh}{\boldsymbol{\hat{y}}}
$$
</div>

We're going to fit a cubic B&eacute;zier curve through $n$ points $\p_0 ... \p_{n-1}$ called the *pattern*.  One of the curve's inner control points will be constrained to lie along a given line.

A cubic curve $\C(t)$ is defined by four control points $\c_i$.
$$ \C(t) = \sum_{i=0}^3 \c_i B_{i,3}(t) $$
The $B_{i,3}(t)$ are Bernstein polynomials.
$$ B_{i,n}(t) = {n \choose i} t^i (1-t)^{n-i} = \frac{n!}{i!(n-i)!} t^i (1-t)^{n-i} $$

We let $0^0 = 1$ so that $B_{0,n}(0) = B_{n,n}(1) = 1$.

Since $\C(0) = \c_0$ and $\C(1) = \c_3$, we set $\c_0 = \p_0$ and $\c_3 = \p_{n-1}$. We are given a unit tangent vector $\vh = v_x \xh + v_y \yh$ and the constraint that $\c_1 = \c_0 + a\vh$.  We can choose $\c_2 = c_{2,x} \xh + c_{2,y} \yh$ freely. We will choose $a$ and $\c_2$ to minimize the sum of the squared distances between each $\p_j$ and a corresponding point $\C(u_j)$.  Note that each $\p_j$ has a corresponding parameter $u_j$ that we treat as a given for this derivation.

The sum of the squared distances mentioned above is $E = \sum_{j=1}^{n-2} (\p_j - \C(u_j))^2$.  (We will consider a vector squared to be the dot-product of the vector with itself; this is the squared length of the vector.) To find the $a$ that minimizes $E$, we set $\partial E/\partial a = 0$.
$$
\begin{eqnarray}
0 = \pd{E}{a}
    &=& \pd{}{a}\sum_j (\p_j - \C(u_j))^2 \\
    &=& \sum_j \cancel{-2} (\p_j - \C(u_j)) \cdot \pd{\C(u_j)}{a}
        \quad\quad\text{(cancel $-2$ against the $0$ on the left)}
\end{eqnarray}
$$
Only the $i=1$ term of $\C(u_j)$ depends on $a$, so
$$
\partial \C(u_j)/\partial a
    = \partial ((\c_0 + a\vh) B_{1,3}(u_j)) / \partial a
    = \vh B_{1,3}(u_j) .
$$

For convenience, let $\V_{j} = \vh B_{1,3}(u_j)$ and $\b_{i,j} = \c_i B_{i,3}(u_j)$. Then $\sum_j (\p_j - \C(u_j)) \cdot \V_j = 0$.  We distribute $\V_j$ and rearrange to get $0 = -\sum_j \p_j \cdot \V_j + \sum_j \C(u_j) \cdot \V_j$.  Now we replace $\C(u_j)$ with its definition and rearrange to isolate the free variables $a$ and $\c_2$.
$$
\begin{eqnarray}
0 &=& \sum_j \p_j \cdot \V_j - \sum_j \C(u_j) \cdot \V_j \\
    &=& \sum_j \p_j \cdot \V_j - \sum_j \left(\b_{0,j} + (\c_0 + a\vh) B_{1,3}(u_j) + \b_{2,j} + \b_{3,j}\right) \cdot \V_j \\
    &=& \sum_j \p_j \cdot \V_j - \sum_j \left( \b_{0,j} + \c_0 B_{1,3}(u_j) + a\V_j + \b_{2,j} + \b_{3,j}\right) \cdot \V_j \\
a \sum_j {\V_j}^2 + \sum_j \b_{2,j} \cdot \V_j
    &=& \sum_j \V_j \cdot \left( \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j} \right) \\
a \sum_j {\V_j}^2 + \c_2 \cdot \sum_j \V_j B_{2,3}(u_j)
    &=& \sum_j \V_j \cdot \left( \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j} \right)
\end{eqnarray}
$$
Since $\vh$ is a unit vector, ${\V_j}^2 = \vh\cdot\vh (B_{1,3}(u_j))^2 = (B_{1,3}(u_j))^2$.  Also we need to expand $\c_2$ to actually compute its value.
$$
a \sum_j (B_{1,3}(u_j))^2 + c_{2,x} v_x \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + c_{2,y} v_y \sum_j B_{1,3}(u_j) B_{2,3}(u_j)
    = \sum_j \V_j \cdot \left(
        \p_j - \b_{0,j} + \c_1 B_{1,3}(u_j) - \b_{3,j}
    \right)
\tag{1}
$$

To find the $\c_2$ that minimizes $E$, we first set $\partial E/\partial c_{2,x} = 0$.
$$
\begin{eqnarray}
0 = \pd{E}{c_{2,x}}
    &=& \sum_j (\p_j - \C(u_j)) \cdot \pd{\C(u_j)}{c_{2,x}} \\
    &=& \sum_j (\p_j - \C(u_j)) \cdot \xh B_{2,3}(u_j) \\
    &=& \sum_j \p_j \cdot \xh B_{2,3}(u_j)
\end{eqnarray}
$$
Let $\X_j = \xh B_{2,3}(u_j)$ for convenience and expand $\C(u_j)$.
$$
\begin{eqnarray}
0 &=& \sum_j \p_j \cdot \X_j - \sum_j \C(u_j) \cdot \X_j \\
    &=& \sum_j \p_j \cdot \X_j - \sum_j \left(
            \b_{0,j} \cdot \X_j
            + (\c_0 + a\vh) B_{1,3}(u_j) \cdot \X_j
            + \b_{2,j} \cdot \X_j
            + \b_{3,j} \cdot \X_j
        \right) \\
a\vh \cdot \sum_j \X_j B_{1,3}(u_j) + \sum_j \b_{2,j} \cdot \X_j
    &=& \sum_j \X_j \cdot \left(
            \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}
        \right) \\
a\vh \cdot \xh \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + \c_2 \cdot \xh \sum_j (B_{2,3}(u_j))^2
    &=& \sum_j \X_j \cdot \left(
            \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}
        \right)
\end{eqnarray}
$$

We expand $\c_2$ so that we can compute its value.
$$
a v_x \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + c_{2,x} \sum_j (B_{2,3}(u_j))^2 + c_{2,y} \times 0
    = \sum_j \X_j \cdot \left(
            \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}
        \right)
\tag{2}
$$

To find the $\c_2$ that minimizes $E$, we also need to set $\partial E/\partial c_{2,y} = 0$, and we obtain a similar equation, where $\Y_j = \yh B_{2,3}(u_j)$.
$$
a v_y \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + c_{2,x} \times 0 + c_{2,y} \sum_j (B_{2,3}(u_j))^2
    = \sum_j \Y_j \cdot \left(
            \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}
        \right)
\tag{3}
$$

Equations (1), (2), and (3) together for a linear system with three unknowns $a$, $c_{2,x}$, and $c_{2,y}$.

