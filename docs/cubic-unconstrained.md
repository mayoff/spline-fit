<!-- To format this file, you need to use a hacked version of Markdown that ignores MathJax sections containing in $...$ and $$...$$ delimiters. -->

<div style='display:none'>
$$
\newcommand{\pd}[2]{\frac{\partial#1}{\partial#2}}
$$
</div>

We're going to fit a cubic B&eacute;zier curve through $n$ points $p_0 ... p_{n-1}$ called the *pattern*. This will be an "unconstrained" fit because there are no other constraints on the curve besides fitting the pattern.

A cubic curve $C(t)$ is defined by four control points $c_i$.
$$ C(t) = \sum_{i=0}^3 c_i B_{i,3}(t) $$
The $B_{i,3}(t)$ are Bernstein polynomials.
$$ B_{i,n}(t) = {n \choose i} t^i (1-t)^{n-i} = \frac{n!}{i!(n-i)!} t^i (1-t)^{n-i} $$

We let $0^0 = 1$ so that $B_{0,n}(0) = B_{n,n}(1) = 1$.

Since $C(0) = c_0$ and $C(1) = c_3$, we set $c_0 = p_0$ and $c_3 = p_{n-1}$. We will choose $c_1$ and $c_2$ to minimize the sum of the squared distances between each $p_j$ and a corresponding point $C(u_j)$. Note that each $p_j$ has a corresponding parameter $u_j$ that we treat as a given for this derivation.

The sum of the squared distances mentioned above is $E = \sum_{j=1}^{n-2} (p_j - C(u_j))^2$. To find the $c_1$ that minimizes $E$, we set $\partial E/\partial c_1 = 0$.
$$
\begin{align}
0 = \pd{E}{c_1}
    &= \pd{}{c_1}\sum_{j=1}^{n-2} (p_j - C(u_j))^2 \\
    &= \sum_{j=1}^{n-2} \cancel{-2} (p_j - C(u_j)) \pd{C(u_j)}{c_1}
        \quad\quad\text{(cancel $-2$ against the $0$ on the left)}
\end{align}
$$
The only term of $C(u_j)$ that depends on $c_1$ is the $i=1$ term, so 
$
\partial C(u_j)/\partial c_1 = \partial c_1 B_{1,3}(u_j)/\partial c_1 = B_{1,3}(u_j)
$.
Let $A_{i,n} = B_{i,n}(u_j)$ for convenience. Then $\sum_j (p_j - C(u_j))A_{1,3} = 0$. We distribute $A_{1,3}$ and rearrange to get $0 = -\sum_j p_j A_{1,3} + \sum_j C(u_j) A_{1,3}$. Now we replace $C(u_j)$ with its definition and rearrange to isolate $c_1$ and $c_2$.
$$
\begin{align}
0
    &= -\sum_j p_j A_{1,3} + \sum_j C(u_j) A_{1,3} \\
    &= -\sum_j p_j A_{1,3} + \sum_j (c_0 A_{0,3} A_{1,3} + c_1 {A_{1,3}}^2 + c_2 A_{2,3} A_{1,3} + c_3 A_{3,3} A_{1,3}) \\
    &= -\sum_j p_j A_{1,3} + \sum_j c_0 A_{0,3} A_{1,3} + c_1 \sum_j {A_{1,3}}^2 + c_2 \sum_j A_{2,3} A_{1,3} + \sum_j c_3 A_{3,3} A_{1,3} \\
c_1 \sum_j {A_{1,3}}^2 + c_2 \sum_j A_{2,3} A_{1,3}
    &= \sum_j (p_j A_{1,3} - c_0 A_{0,3} A_{1,3} - c_3 A_{3,3} A_{1,3})
    \tag{1}
\end{align}
$$

To find the $c_2$ that minimizes $E$, we set $\partial E/\partial c_2 = 0$ and obtain a similar equation.
$$ 
c_1 \sum_j A_{1,3} A_{2,3} + c_2 \sum_j {A_{2,3}}^2
    = \sum_j (p_j A_{2,3} - c_0 A_{0,3} A_{2,3} - c_3 A_{3,3} A_{2,3})
    \tag{2}
$$

Equations $(1)$ and $(2)$ together form a linear system with two unknowns $c_1$ and $c_2$, which we solve.  We define a few variables for convenience:
$$
\begin{align}
m_1 &= \sum_j {A_{1,3}}^2 \\
m_{12} &= \sum_j A_{1,3} A_{2,3} \\
m_2 &= \sum_j {A_{2,3}}^2 \\
b_1 &= \sum_j (p_j A_{1,3} - c_0 A_{0,3} A_{1,3} - c_3 A_{3,3} A_{1,3}) \\
b_2 &= \sum_j (p_j A_{2,3} - c_0 A_{0,3} A_{2,3} + c_3 A_{3,3} A_{2,3})
\end{align}
$$
Then the solutions of the system are
$$
\begin{align}
c_1 &= \frac{b_1 m_2 - b_2 m_{12}}{m_1 m_2 - {m_{12}}^2} \\
\text{and } c_2 &= \frac{b_2 m_1 - b_1 m_{12}}{m_1 m_2 - {m_{12}}^2} .
\end{align}
$$

Note that if the pattern contains fewer than four points, the system is underconstrained and unstable.  In that case we fit a degree-0, degree-1, or degree-2 B&eacute;zier curve instead and elevate its degree to 3.  See [quadratic.html](quadratic.html) for the degree-2 derivation.  If the pattern contains exactly four distinct points, the cubic curve will pass through all four exactly.

