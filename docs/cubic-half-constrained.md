<!-- To format this file, you need to use a hacked version of Markdown that ignores MathJax sections containing in $...$ and $$...$$ delimiters. -->

<div style='display:none'>
$$
\newcommand{\pd}[2]{\frac{\partial#1}{\partial#2}}
\newcommand{\C}{\boldsymbol C}
\newcommand{\b}{\boldsymbol b}
\newcommand{\c}{\boldsymbol c}
\newcommand{\p}{\boldsymbol p}
\newcommand{\vh}{\boldsymbol{\hat{v}}}
\newcommand{\xh}{\boldsymbol{\hat{x}}}
\newcommand{\yh}{\boldsymbol{\hat{y}}}
$$
</div>

We're going to fit a cubic B&eacute;zier curve through $n$ points $\p_0 ... \p_{n-1}$.  One of the curve's inner control points will be constrained to lie along a given line.

A cubic curve $\C(t)$ is defined by four control points $\c_i$.
$$ \C(t) = \sum_{i=0}^3 \c_i B_{i,3}(t) $$
The function $B_{i,3}(t)$ is a Bernstein polynomial.
$$ B_{i,n}(t) = {n \choose i} t^i (1-t)^{n-i} = \frac{n!}{i!(n-i)!} t^i (1-t)^{n-i} $$

We let $0^0 = 1$ so that $B_{0,n}(0) = B_{n,n}(1) = 1$.

We are given $\c_0 = \p_0$ and $\c_3 = \p_{n-1}$. We are also given a unit vector $\vh = v_x \xh + v_y \yh$ and the constraint that $\c_1 = \c_0 + a \vh$ for some $a > 0$. We are also given a parameter value $u_j$ for each $\p_j$, with $u_0 = 0$, $u_{n-1} = 1$, and $u_{j} < u_{j+1}$ for $0 \le j \lt n-1$.

We need to choose $a$, $c_{2,x}$, and $c_{2,y}$ (where $\c_2 = c_{2,x}\xh + c_{2,y}\yh$) to define the curve $\C(t)$.  Each $\p_j$ will then have a corresponding point on the curve, $\C(u_j)$.  The square of the distance between $\p_j$ and $\C(u_j)$ is $(\p_j - \C(u_j))\cdot(\p_j - \C(u_j))$, which we'll write $(\p_j - \C(u_j))^2$.  The sum of all such distances is $E = \sum_{j=0}^{n-1} (\p_j - \C(u_j))^2$.  We'll choose $a$, $c_{2,x}$, and $c_{2,y}$ to minimize $E$.

First, we'll take the partial derivative of $E$ with respect to each of $a$, $c_{2,x}$, and $c_{2,y}$.  Each of these will give us a linear equation in those three unknowns.  Then we'll solve the system of three linear equations for the three unknowns.

### Partial derivative with respect to $a$

First, we'll set $\partial E/\partial a = 0$ and work toward a linear equation in the three unknowns..
$$
\begin{eqnarray}
0 = \pd{E}{a}
    &=& \pd{}{a}\sum_j (\p_j - \C(u_j))^2 \\
    &=& \sum_j \cancel{-2} (\p_j - \C(u_j)) \cdot \pd{\C(u_j)}{a} \\
    & & \quad\quad\text{(cancel $-2$ against $0$ on the left)}
\end{eqnarray}
$$
Only the $i=1$ term of $\C(u_j)$ depends on $a$, so
$$
\pd{\C(u_j)}{a}
    = \pd{(\c_0 + a\vh) B_{1,3}(u_j)}{a}
    = \vh B_{1,3}(u_j)
$$
and
$$
0 = \pd{E}{a} = \sum_j (\p_j - \C(u_j)) \cdot \vh B_{1,3}(u_j) .
$$
To turn this into a more explicit linear equation in our three unknowns, we need to expand $\C(u_j)$ and rearrange things.  It will be useful to define $\b_{i,j} = \c_i B_{i,3}(u_j)$ for brevity.
$$
\begin{eqnarray}
0   &=& \sum_j (\p_j - \C(u_j)) \cdot \vh B_{1,3}(u_j) \\
    &=& \sum_j \left( \p_j - \left( \b_{0,j} + (\c_0 + a \vh) B_{1,3}(u_j) 
        + \b_{2,j} + \b_{3,j} \right) \right) \cdot \vh B_{1,3}(u_j) \\
    &=& \sum_j \left( \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - a \vh B_{1,3}(u_j)
        - \b_{2,j} - \b_{3,j} \right) \cdot \vh B_{1,3}(u_j) \\
\sum_j a (\vh B_{1,3}(u_j))^2 + \sum_j \b_{2,j} \cdot \vh B_{1,3}(u_j)
    &=& \sum_j \left( \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j} \right) \cdot \vh B_{1,3}(u_j)
\end{eqnarray}
$$

We can simplify $(\vh B_{1,3}(u_j))^2$ by recalling that $\vh$ is a unit vector, meaning $(\vh\cdot\vh)^{1/2} = 1$, so $\vh\cdot\vh = 1$.
$$
(\vh B_{1,3}(u_j))^2 = \vh^2 (B_{1,3}(u_j))^2 = (B_{1,3}(u_j))^2
$$

We also need to expand $\b_{2,j}$ to make $c_{2,x}$ and $c_{2,y}$ explicit.
$$
\begin{eqnarray}
\b_{2,j} \cdot \vh B_{1,3}(u_j)
    &=& \c_2 B_{2,3}(u_j) \cdot \vh B_{1,3}(u_j) \\
    &=& B_{1,3}(u_j) B_{2,3}(u_j) (c_{2,x}\xh + c_{2,y}\yh) \cdot (v_x \xh + v_y \yh) \\
    &=& B_{1,3}(u_j) B_{2,3}(u_j) (c_{2,x} v_x + c_{2,y} v_y) \\
    &=& c_{2,x} v_x B_{1,3}(u_j) B_{2,3}(u_j) + c_{2,y} v_y B_{1,3}(u_j) B_{2,3}(u_j)
\end{eqnarray}
$$

So finally our linear equation in the three unknowns $a$, $c_{2,x}$, and $c_{2,y}$ is
$$
a \sum_j (B_{1,3}(u_j))^2 + c_{2,x} v_x \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + c_{2,y} v_y \sum_j B_{1,3}(u_j) B_{2,3}(u_j)
    = \sum_j \left( \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j} \right) \cdot \vh B_{1,3}(u_j)
.
\tag{1}
$$

### Partial derivative with respect to $c_{2,x}$

Next we set $\partial E/\partial c_{2,x} = 0$.
$$
\begin{eqnarray}
0 = \pd{E}{c_{2,x}}
    &=& \sum_j (\p_j - \C(u_j)) \cdot \pd{\C(u_j)}{c_{2,x}} \\
    &=& \sum_j (\p_j - \C(u_j)) \cdot \xh B_{2,3}(u_j) \\
    &=& \sum_j (\p_j - \C(u_j)) \cdot \xh B_{2,3}(u_j) \\
    &=& \sum_j \left(\p_j - \left( \b_{0,j} + (\c_0 + a \vh) B_{1,3}(u_j) + \b_{2,j} + \b_{3,j} \right) \right) \cdot \xh B_{2,3}(u_j) \\
    &=& \sum_j \left(\p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - a \vh B_{1,3}(u_j) - \b_{2,j} - \b_{3,j} \right) \cdot \xh B_{2,3}(u_j) \\
\sum_j a \vh B_{1,3}(u_j) \cdot \xh B_{2,3}(u_j) + \sum_j \b_{2,j} \cdot \xh B_{2,3}(u_j)
    &=& \sum_j \left(\p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}\right) \cdot \xh B_{2,3}(u_j) 
\end{eqnarray}
$$
The explicit linear equation we need is finally
$$
a v_x \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + c_{2,x} \sum_j (B_{2,3}(u_j))^2 + c_{2,y} \times 0
    = \sum_j \left(\p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}\right) \cdot \xh B_{2,3}(u_j)
.
\tag{2}
$$

### Partial derivative with respect to $c_{2,y}$

Finally, we set set $\partial E/\partial c_{2,y} = 0$.  The algebra is almost identical to the previous case, so we'll cut to the chase.
$$
a v_y \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + c_{2,x} \times 0 + c_{2,y} \sum_j (B_{2,3}(u_j))^2
    = \sum_j \left(\p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}\right) \cdot \yh B_{2,3}(u_j)
\tag{3}
$$

### Solving the linear system

Equations (1), (2), and (3) together for a linear system with three unknowns $a$, $c_{2,x}$, and $c_{2,y}$.  Here are those equations again:
$$
\begin{eqnarray}
&& a \sum_j (B_{1,3}(u_j))^2 &+& c_{2,x} v_x \sum_j B_{1,3}(u_j) B_{2,3}(u_j) &+& c_{2,y} v_y \sum_j B_{1,3}(u_j) B_{2,3}(u_j)
    &=& \sum_j \left( \p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j} \right) \cdot \vh B_{1,3}(u_j)
\\
&& a v_x \sum_j B_{1,3}(u_j) B_{2,3}(u_j) &+& c_{2,x} \sum_j (B_{2,3}(u_j))^2 &+& c_{2,y} \times 0
    &=& \sum_j \left(\p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}\right) \cdot \xh B_{2,3}(u_j)
\\
&& a v_y \sum_j B_{1,3}(u_j) B_{2,3}(u_j) &+& c_{2,x} \times 0 &+& c_{2,y} \sum_j (B_{2,3}(u_j))^2
    &=& \sum_j \left(\p_j - \b_{0,j} - \c_0 B_{1,3}(u_j) - \b_{3,j}\right) \cdot \yh B_{2,3}(u_j)
\end{eqnarray}
$$
To make those cumbersome coefficients more manageable, we'll invent some shorter names for them:
$$
\begin{eqnarray}
a m_{0,0} &+& c_{2,x} m_{0,1} &+& c_{2,y} m_{0,2} &=& b_0 \\
a m_{1,0} &+& c_{2,x} m_{1,1} &+& c_{2,y} \times 0 &=& b_1 \\
a m_{2,0} &+& c_{2,x} \times 0 &+& c_{2,y} m_{2,2} &=& b_2
\end{eqnarray}
$$
We can use whatever method we like, such as Gaussian elimination with partial pivoting, to solve this system.  If we're not worried about numerical instability, we can just use these equations:
$$
\begin{eqnarray}
d &=& m_{0,2} m_{1,1} m_{2,0} + m_{0,1} m_{1,0} m_{2,2} - m_{0,0} m_{1,1} m_{2,2} \\
a &=& d^{-1} (b_2 m_{0,2} m_{1,1} + b_1 m_{0,1} m_{2,2} - b_0 m_{1,1} m_{2,2}) \\
c_{2,x} &=& d^{-1} (b_1 m_{0,2} m_{2,0} + b_0 m_{1,0} m_{2,2} - b_1 m_{0,0} m_{2,2} - b_2 m_{0,2} m_{1,0}) \\
c_{2,y} &=& d^{-1} (b_2 m_{0,1} m_{1,0} + b_0 m_{1,1} m_{2,0} - b_2 m_{0,0} m_{1,1} - b_1 m_{0,1} m_{2,0})
\end{eqnarray}
$$

