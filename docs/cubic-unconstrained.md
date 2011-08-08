<!-- To format this file, you need to use a hacked version of Markdown that ignores MathJax sections containing in $...$ and $$...$$ delimiters. -->

<div style='display:none'>
$$
\newcommand{\pd}[2]{\frac{\partial#1}{\partial#2}}
$$
</div>

We're going to fit a cubic B&eacute;zier curve through points $p_0 ... p_{n-1}$. This will be an &ldquo;unconstrained&rdquo; fit because there are no other constraints on the curve besides fitting the points $p_j$.

A cubic curve $C(t)$ is defined by four control points $c_i$.
$$ C(t) = \sum_{i=0}^3 c_i B_{i,3}(t) $$
The $B_{i,3}(t)$ are Bernstein polynomials.
$$ B_{i,n}(t) = {n \choose i} t^i (1-t)^{n-i} = \frac{n!}{i!(n-i)!} t^i (1-t)^{n-i} $$

We let $0^0 = 1$ so that $B_{0,n}(0) = B_{n,n}(1) = 1$.

We need to choose the four points $c_i$ to define the curve.
For each $p_j$, we're given a $u_j$ to use as the parameter to function $C$, where $u_0 = 0$, $u_{n-1} = 1$, and $u_j < u_{j+1}$ for $0 \le j \lt n-1$. Each $p_j$ will then be a distance $p_j - C(u_j)$ from its corresponding point on the curve.  We'll choose the $c_i$ so that the sum of squared distances, $E = \sum_j (p_j - C(u_j))^2$, is minimized.

Since $C(0) = c_0$, we must set $c_0 = p_0$. Since $C(1) = c_3$, we must set $c_3 = p_{n-1}$. We are left to find the best $c_1$ and $c_2$.

To find the $c_1$ and $c_2$ that minimize $E$, we'll take the partial derivatives of $E$ with respect to $c_1$ and to $c_2$ and set them to zero.  Each of these will give us a linear equation in those two unknowns.  We can then solve the system of two linear equations for $c_1$ and $c_2$.

### Partial derivative with respect to $c_1$

First, we'll set $\partial E/\partial{c_1} = 0$ and work toward a linear equation in the two unknowns.
$$
\begin{align}
0 = \pd{E}{c_1}
    =& \pd{}{c_1}\sum_{j=1}^{n-2} (p_j - C(u_j))^2 \\
    =& \sum_{j=1}^{n-2} \cancel{-2} (p_j - C(u_j)) \pd{C(u_j)}{c_1}
        \quad\quad\text{(cancel $-2$ against the $0$ on the left)}
\tag{1}
\end{align}
$$
The only term of $C(u_j)$ that depends on $c_1$ is the $i=1$ term, so 
$$
\pd{C(u_j)}{c_1} = \pd{\ 3 c_1 B_{1,3}(u_j)}{c_1} = 3 B_{1,3}(u_j).
$$
Substituting this into $(1)$ gives
$$
0 = \sum_j (p_j - C(u_j)) \times 3 B_{1,3}(u_j) = \sum_j (p_j - C(u_j)) B_{1,3}(u_j) .
$$
Now we'll expand $C(u_j)$ and rearrange the terms to isolate the unknowns. Let $b_{i,j} = c_i B_{i,3}(u_j)$ for brevity.
$$
\begin{align}
0
    &= \sum_j \left( p_j - b_{0,j} - b_{1,j} - b_{2,j} - b_{3,j} \right) B_{1,3}(u_j) \\
\sum_j ( b_{1,j} B_{1,3}(u_j) ) + \sum_j ( b_{2,j} B_{1,3}(u_j) ) 
    &= \sum_j \left( p_j - b_{0,j} - b_{3,j} \right) B_{1,3}(u_j) \\
c_1 \sum_j ( B_{1,3}(u_j) )^2 + c_2 \sum_j B_{1,3}(u_j) B_{2,3}(u_j) 
    &= \sum_j \left( p_j - b_{0,j} - b_{3,j} \right) B_{1,3}(u_j)
\tag{2}
\end{align}
$$

### Partial derivative with respect to $c_2$

Following the same steps after setting $\partial E/\partial c_2 = 0$ gives a similar equation:
$$
c_1 \sum_j B_{1,3}(u_j) B_{2,3}(u_j) + c_2 \sum_j ( B_{2,3}(u_j) )^2
    = \sum_j \left( p_j - b_{0,j} - b_{3,j} \right) B_{2,3}(u_j)
\tag{3}
$$

### Solving the linear system

Now we'll solve the linear system of equations $(2)$ and $(3)$.  Here are those equations again:
$$
\begin{array}{lll}
c_1 \sum_j ( B_{1,3}(u_j) )^2 & {} + c_2 \sum_j B_{1,3}(u_j) B_{2,3}(u_j) 
    & {} = \sum_j \left( p_j - b_{0,j} - b_{3,j} \right) B_{1,3}(u_j) \\
c_1 \sum_j B_{1,3}(u_j) B_{2,3}(u_j) & {} + c_2 \sum_j ( B_{2,3}(u_j) )^2
    & {} = \sum_j \left( p_j - b_{0,j} - b_{3,j} \right) B_{2,3}(u_j)
\end{array}
$$

Let's invent shorter names for the components of this system:
$$
\begin{array}{lll}
c_1 m_1 & {} + c_2 m_{12} & {} = b_0 \\
c_1 m_{12} & {} + c_2 m_2 & {} = b_1
\end{array}
$$
Then the solutions of the system are
$$
\begin{align}
c_1 &= \frac{b_0 m_2 - b_1 m_{12}}{m_1 m_2 - {m_{12}}^2} \\
\text{and } c_2 &= \frac{b_1 m_1 - b_0 m_{12}}{m_1 m_2 - {m_{12}}^2} .
\end{align}
$$


