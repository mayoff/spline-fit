<!-- To format this file, you need to use a hacked version of Markdown that ignores MathJax sections containing in $...$ and $$...$$ delimiters. -->
<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML"></script>
<script type="text/javascript">
    MathJax.Hub.Config({
        "HTML-CSS": { availableFonts:[] },
        "tex2jax": { inlineMath: [ [ '$', '$' ] ] }
    });
</script>

We're going to fit a cubic B&eacute;zier curve through three points $p_i$ which comprise the *pattern*.  First we'll fit a quadratic curve through the points, then we'll elevate the degree of the curve to make it cubic.

A quadratic curve $Q(t)$ is defined by three control points $q_i$.
$$ Q(t)
    = \sum_{i=0}^2 q_i B_{i,2}(t)
    = q_0 B_{0,2}(t) + q_1 B_{1,2}(t) + q_2 B_{2,2}(t)
$$
The $B_{i,2}(t)$ are Bernstein polynomials.
$$ B_{i,n}(t) = {n \choose i} t^i (1-t)^{n-i} = {n! \over i!(n-i)!} t^i (1-t)^{n-i} $$

We let $0^0 = 1$ so that $B_{0,n}(0) = B_{n,n}(1) = 1$.

Since $Q(0) = q_0$ and $Q(1) = q_2$, we set $q_0 = p_0$ and $q_2 = p_2$.  However, $Q(t)$ doesn't pass through $q_1$ in general, so we can't just set $q_1 = p_1$.  We have to find a $q_1$ that makes $Q(t)$ pass through $p_1$.  Let's say $Q(u) = p_1$ for some $u$.

$$ p_1 = Q(u) = p_0 B_{0,2}(u) + q_1 B_{1,2}(u) + p_2 B{2,2}(u) $$

We solve for $q_1$.

$$ q_1 = {p_1 - p_0 B_{0,2}(u) - p_2 B_{2,2}(u) \over B_{1,2}(u) }
    = {p_1 - p_0(1-u)^2 - p_2 u^2 \over 2u(1-u)}$$

Note that we can choose $u$ arbitrarily.  Two obvious candidates are $1\over 2$ and $\lvert p_1 - p_0 \rvert \over \lvert p_1 - p_0 \rvert + \lvert p_2 - p_1 \rvert$.

A cubic curve $C(t)$ is defined by four control points $c_i$.
$$ C(t) = \sum_{i=0}^3 c_i B_{i,3}(t) $$
To make $C(t) = Q(t)$, we choose $c_i$ as follows:
$$
\begin{aligned}
c_0 &= q_0 &=& p_0 \\
c_1 &= q_0/3 + 2q_1/3 &=& p_0/3 + (p_1 - p_0(1-u)^2 - p_2 u^2)/(3u(1-u)) \\
c_2 &= q_2/3 + 2q_1/3 &=& p_2/3 + (p_1 - p_0(1-u)^2 - p_2 u^2)/(3u(1-u)) \\
c_3 &= q_2 &=& p_2
\end{aligned}
$$

