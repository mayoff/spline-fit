<!-- To format this file, you need to use a hacked version of Markdown that ignores MathJax sections containing in $...$ and $$...$$ delimiters. -->

<div style='display:none'>
$$
\newcommand{\pd}[2]{\frac{\partial#1}{\partial#2}}
\newcommand{\C}{\boldsymbol C}
\newcommand{\c}{\boldsymbol c}
\newcommand{\p}{\boldsymbol p}
\newcommand{\vh}{\boldsymbol{\hat{v}}}
$$
</div>

We're going to fit a quadratic B&eacute;zier curve through three points $\p_0$, $\p_1$, and $\p_2$.  The middle control point of the curve will be constrained to lie along a given line.

A quadratic curve $\C(t)$ is defined by three control points $\c_i$.
$$ \C(t) = \sum_{i=0}^2 \c_i B_{i,2}(t) $$
The function $B_{i,2}(t)$ is a Bernstein polynomial.
$$ B_{i,n}(t) = {n \choose i} t^i (1-t)^{n-i} = \frac{n!}{i!(n-i)!} t^i (1-t)^{n-i} $$

We let $0^0 = 1$ so that $B_{0,n}(0) = B_{n,n}(1) = 1$.

We're given parameter values $u_0 = 0$, $u_1$, and $u_2 = 1$ and we're supposed to try to make $\C(u_j) = \p_j$. We're also given a unit vector $\vh = v_x \x_h + v_y \yh$ and the constraint that $\c_1 = \c_0 + a \vh$ for some $a$.

Because $u_0 = 0$ and $u_2 = 1$, we can immediately set $\c_0 = \p_0$ and $\c_2 = \p_2$.  This leaves us to find the optimal $\c_1$, which really means finding the optimal $a$. We'll do this by minimizing the squared distance from $\C(u_1)$ to $\p_1$, $E = (\p_1 - \C(u_1))^2$. We find the optimal $a$ by setting $\partial E/\partial a = 0$.

$$
\begin{align}
0 = \pd{E}{a}
    &= \cancel{-2}(\p_1 - \C(u_1))\pd{\C(u_1)}{a} \\
    &= (\p_1 - \C(u_1)) \cdot \vh B_{1,2}(u_1) \\
    &= \left(\p_1 - \c_0 B_{0,2}(u_1) - (\c_0 + a \vh) B_{1,2}(u_1) - \c_2 B_{2,2}(u_1)\right) \cdot \vh B_{1,2}(u_1) \\
    &= \left(\p_1 - \c_0 \left(B_{0,2}(u_1) + B_{1,2}(u_1)\right) - a \vh B_{1,2}(u_1) - \c_2 B_{2,2}(u_1)\right) \cdot \vh B_{1,2}(u_1) \\
a \vh \cdot \vh (B_{1,2}(u_1))^2
    &= \left(\p_1 - \c_0 \left(B_{0,2}(u_1) + B_{1,2}(u_1)\right) - \c_2 B_{2,2}(u_1)\right) \cdot \vh B_{1,2}(u_1) \\
a &= \frac{\left(\p_1 - \c_0 \left(B_{0,2}(u_1) + B_{1,2}(u_1)\right) - \c_2 B_{2,2}(u_1)\right) \cdot \vh B_{1,2}(u_1)}{\vh \cdot \vh (B_{1,2}(u_1))^2}
\end{align}
$$

Because $\vh$ is a unit vector, $\vh \cdot \vh = 1$, so we can drop that term.

$$
a = \frac{\left(\p_1 - \c_0 \left(B_{0,2}(u_1) + B_{1,2}(u_1)\right) - \c_2 B_{2,2}(u_1)\right) \cdot \vh B_{1,2}(u_1)}{(B_{1,2}(u_1))^2}
$$

