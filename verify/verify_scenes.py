"""Re-derives every number a teaching scene of chapter 1 states.

A scene that says "the eigenvalues are 0 and 2" is making a claim, and a claim
nobody re-derives is a claim nobody has checked. Each entry below names the
scene, records the number as the scene prints it, and computes the same quantity
by a route the scene does not take.

What "a different route" means here is concrete, and it is the whole value of
the file:

  * A scene that reaches an eigenvalue through the characteristic polynomial is
    checked against `numpy.linalg.eigvalsh`, which runs a similarity reduction
    and never forms that polynomial.
  * A scene that writes a matrix exponential as a sum over spectral projectors,
    or as a closed form in a cosine and a sine, is checked against
    `scipy.linalg.expm`, which uses a scaling-and-squaring Pade approximant and
    knows nothing about eigenvalues.
  * A scene that orthogonalises by hand is checked against `numpy.linalg.qr`,
    which uses Householder reflections rather than projections and subtractions.
  * A scene that computes an overlap by hand is checked symbolically with SymPy,
    which never rounds.

Copying the scene's own expression into Python and evaluating it would verify
that JavaScript and Python agree about multiplication, which was never in doubt.

Adding a check is adding a dict to CHECKS. The runner does not change.
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np
import sympy as sp
from scipy.linalg import expm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402
from qops import (BELL_PHI_P, H, I2, KET0, KET1, KETM, KETP,  # noqa: E402
                  X, Y, Z, amp_damp, bloch, channel, dev, direction,
                  hermiticity, inner, kron, ndotsigma, outer,
                  partial_trace, phase_flip, proj, purity, unitarity,
                  von_neumann)

# ── 1.1 Vectors, dual vectors and the inner product ─────────────────────────


def _squared_length_symbolic():
    """<psi|psi> for (2+i, 1-3i), by symbolic conjugation rather than by moduli.

    The scene squares two moduli and adds. SymPy is asked instead for
    sum(z * conjugate(z)) and told to expand it, which reaches the same integer
    without ever naming a modulus.
    """
    entries = [sp.Integer(2) + sp.I, sp.Integer(1) - 3 * sp.I]
    total = sum(z * sp.conjugate(z) for z in entries)
    return complex(sp.expand(sp.simplify(total))).real


def _prob_zero_of_that_state():
    """The Born probability of 0 for the same state, from the normalised column."""
    v = np.array([2 + 1j, 1 - 3j], dtype=complex)
    v = v / np.linalg.norm(v)
    return abs(inner(KET0, v)) ** 2


def _overlap_of_the_two_circular_states():
    """<a|b> for a = (1,i)/sqrt2 and b = (1,-i)/sqrt2, symbolically."""
    r = 1 / sp.sqrt(2)
    a = sp.Matrix([r, r * sp.I])
    b = sp.Matrix([r, -r * sp.I])
    return abs(complex(sp.simplify((a.conjugate().T * b)[0, 0])))


def _same_overlap_without_the_conjugate():
    """The number the scene warns about: the same sum with no conjugation.

    Reached symbolically, so it is the definition of the wrong operation and not
    a call to the NumPy routine that performs it.
    """
    r = 1 / sp.sqrt(2)
    a = sp.Matrix([r, r * sp.I])
    b = sp.Matrix([r, -r * sp.I])
    return abs(complex(sp.simplify((a.T * b)[0, 0])))


def _overlap_along_the_family(theta):
    """|<0|psi(theta)>|^2, with psi(theta) produced by a rotation rather than
    by writing cos and sin down.

    The scene defines psi(theta) = cos(theta/2)|0> + sin(theta/2)|1>. Here the
    same state is produced as exp(-i theta Y / 2)|0>, evaluated by expm, so the
    half angle is a consequence of the exponential rather than an assumption.
    """
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    psi = expm(-1j * theta * Ymat / 2) @ KET0
    return abs(inner(KET0, psi)) ** 2


def _coefficient_of_plus_in_zero():
    """<+|0>, read off the Hadamard matrix rather than computed by hand.

    The columns of H are |+> and |->, so the first row of H is the pair of
    coefficients of |0> in that basis.
    """
    return abs(complex(H[0, 0]))


# ── 1.2 Amplitude, phase and interference ───────────────────────────────────


def _modulus_of_minus_one_plus_i():
    return float(sp.Abs(-1 + sp.I))


def _phase_of_minus_one_plus_i():
    """The argument, from atan2 rather than from the quadrant argument."""
    return float(np.angle(-1 + 1j))


def _arctan_trap():
    """What arctan(y/x) returns for the same number: the wrong quadrant."""
    return math.atan(1 / -1)


def _prob_after_hadamard(state):
    out = H @ state
    return abs(inner(KET0, out)) ** 2


# ── 1.3 Outer products and projectors ───────────────────────────────────────


def _outer_zero_one_entry():
    return float(np.real(outer(KET0, KET1)[0, 1]))


def _outer_zero_one_squared_norm():
    M = outer(KET0, KET1)
    return float(np.linalg.norm(M @ M))


def _length_of_projected_zero():
    """||P|0>|| for P = |+><+|, from the matrix rather than from <+|0>."""
    P = outer(KETP, KETP)
    return float(np.linalg.norm(P @ KET0))


def _inner_by_inserting_the_x_basis():
    """<0|1>, computed as a sum over the X basis instead of directly."""
    total = sum(inner(KET0, e) * inner(e, KET1) for e in (KETP, KETM))
    return abs(total)


# ── 1.4 Building an orthonormal basis ───────────────────────────────────────


def _gram_schmidt_second_vector_against_qr():
    """The scene's e2 for the inputs (1,1) and (1,0), against a QR factorisation.

    QR uses Householder reflections and never forms a projection, so agreement
    is a genuine second opinion. The comparison is by overlap magnitude, because
    QR fixes a sign convention the hand calculation does not.
    """
    V = np.array([[1.0, 1.0], [1.0, 0.0]])          # columns are v1 and v2
    Q, _ = np.linalg.qr(V)
    claimed = np.array([1.0, -1.0]) / np.sqrt(2)
    return abs(float(np.vdot(Q[:, 1], claimed)))


# ── 1.5 The tensor product ──────────────────────────────────────────────────


def _index_of_zero_tensor_one():
    """Which entry of |0> ⊗ |1> is non-zero."""
    return float(np.argmax(np.abs(np.kron(KET0, KET1))))


def _corner_entry_of_x_tensor_x():
    return float(np.real(np.kron(X, X)[0, 3]))


def _amplitudes_at_fifty_qubits():
    """2**50, reached through logarithms rather than by exponentiation.

    A different arithmetic route to the same integer: the scene doubles, this
    exponentiates a logarithm. It catches a transcription slip in the printed
    figure, which is the only failure it can have.
    """
    return math.exp(50 * math.log(2.0))


# ── 1.6 Hermitian and unitary operators ─────────────────────────────────────

C_HERM = np.array([[1, 1j], [-1j, 1]], dtype=complex)
ROT = np.array([[0, -1], [1, 0]], dtype=complex)
SHEAR = np.array([[1, 1], [0, 1]], dtype=complex)
U_YBASIS = np.array([[1, 1], [1j, -1j]], dtype=complex) / np.sqrt(2)


def _rotation_eigenvalue_imaginary_part():
    """The eigenvalues of a real rotation, which are off the real axis."""
    return float(np.max(np.abs(np.imag(np.linalg.eigvals(ROT)))))


def _rotation_eigenvalue_real_part():
    return float(np.max(np.abs(np.real(np.linalg.eigvals(ROT)))))


def _length_of_sheared_one():
    return float(np.linalg.norm(SHEAR @ KET1))


def _pauli_closed_form_against_expm(theta):
    """The closed form of the generator scene, against a Pade approximant.

    The scene derives exp(-i theta sigma / 2) = cos(theta/2) I - i sin(theta/2)
    sigma by splitting a power series. `expm` computes the same matrix by
    scaling and squaring and never touches that series, so the difference below
    is a real disagreement if the closed form is wrong.
    """
    closed = math.cos(theta / 2) * I2 - 1j * math.sin(theta / 2) * Z
    return dev(expm(-1j * theta * Z / 2), closed)


def _full_turn_is_minus_identity():
    """exp(-i (2 pi) Z / 2) = -I, from expm rather than from the closed form."""
    return dev(expm(-1j * (2 * math.pi) * Z / 2), -I2)


def _rz_third_of_pi_first_phase():
    """The phase of the (0,0) entry of R_z(pi/3), by expm and atan2."""
    return float(np.angle(expm(-1j * (math.pi / 3) * Z / 2)[0, 0]))


# ── 1.7 The spectral theorem and functions of an operator ───────────────────

A_SYM = np.array([[2, 1], [1, 2]], dtype=complex)
A_CIRC = np.array([[1, -1j], [1j, 1]], dtype=complex)


def _eigs(A):
    return np.linalg.eigvalsh(A)


def _spectral_reassembly(A):
    """||sum_k lambda_k P_k - A||, with the eigenpairs from eigh."""
    w, V = np.linalg.eigh(A)
    rebuilt = sum(w[k] * np.outer(V[:, k], V[:, k].conj()) for k in range(len(w)))
    return dev(rebuilt, A)


def _projectors_resolve_the_identity(A):
    w, V = np.linalg.eigh(A)
    total = sum(np.outer(V[:, k], V[:, k].conj()) for k in range(len(w)))
    return dev(total, I2)


def _square_is_twice(A):
    return dev(A @ A, 2 * A)


def _square_root_squares_back(A):
    root = A / math.sqrt(2)
    return dev(root @ root, A)


def _spectral_exponential_against_expm(A, t):
    w, V = np.linalg.eigh(A)
    spectral = sum(np.exp(-1j * w[k] * t) * np.outer(V[:, k], V[:, k].conj())
                   for k in range(len(w)))
    return dev(spectral, expm(-1j * A * t))


def _exp_of_x_corner():
    return float(np.real(expm(X)[0, 0]))


def _exp_of_x_off_diagonal():
    return float(np.real(expm(X)[0, 1]))


def _entrywise_exponential_negative_eigenvalue():
    wrong = np.array([[math.e ** 0, math.e ** 1], [math.e ** 1, math.e ** 0]])
    return float(np.min(np.linalg.eigvalsh(wrong)))



# ── Module 2 ────────────────────────────────────────────────────────────────
# The postulates: the Born rule, projective measurement, observables,
# compatibility, the Pauli algebra, evolution, and finite-shot estimation.


def _m2_state(theta, phi):
    """cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>, built by two rotations.

    The scenes write the coefficients down. Here the same state is produced by
    turning |0> about y and then about z with `expm`, so the parameterisation is
    a consequence of the generators rather than an assumption.
    """
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    Zmat = np.array([[1, 0], [0, -1]], dtype=complex)
    psi = expm(-1j * phi * Zmat / 2) @ expm(-1j * theta * Ymat / 2) @ KET0
    return psi / np.exp(1j * np.angle(psi[0])) if abs(psi[0]) > 1e-12 else psi


def _m2_bloch(psi):
    """The three Pauli means, from the sandwiches rather than from the angles."""
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    return np.array([float(np.real(np.vdot(psi, M @ psi))) for M in (X, Ymat, Z)])


def _m2_born(psi, ket):
    return abs(inner(ket, psi)) ** 2


def _m2_post_measurement(psi, ket):
    """||P|psi>/sqrt(p) - |ket>||: zero when the update rule lands exactly on
    the basis vector, which is what a rank-one projector must do."""
    P = outer(ket, ket)
    p = float(np.real(np.vdot(psi, P @ psi)))
    out = (P @ psi) / math.sqrt(p)
    out = out / np.exp(1j * np.angle(out[np.argmax(np.abs(out))]))
    return dev(out, ket)


def _m2_readout(q, eps):
    """The reported probability of 0 through a symmetric readout, from the
    effect operator rather than from the line the scene prints."""
    E0 = (1 - eps) * outer(KET0, KET0) + eps * outer(KET1, KET1)
    psi = np.array([math.sqrt(q), math.sqrt(1 - q)], dtype=complex)
    return float(np.real(np.vdot(psi, E0 @ psi)))


def _m2_expectation(A, psi):
    return float(np.real(np.vdot(psi, A @ psi)))


def _m2_variance(A, psi):
    return _m2_expectation(A @ A, psi) - _m2_expectation(A, psi) ** 2


def _m2_commutator_dev(A, B, claim):
    return dev(A @ B - B @ A, claim)


def _m2_pauli_product_dev():
    """The cyclic rule, checked on all nine ordered pairs at once."""
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    S = [X, Ymat, Z]
    eps = np.zeros((3, 3, 3))
    for (i, j, k) in ((0, 1, 2), (1, 2, 0), (2, 0, 1)):
        eps[i, j, k] = 1.0
        eps[i, k, j] = -1.0
    worst = 0.0
    for i in range(3):
        for j in range(3):
            claim = (1.0 if i == j else 0.0) * I2 + 1j * sum(
                eps[i, j, k] * S[k] for k in range(3))
            worst = max(worst, dev(S[i] @ S[j], claim))
    return worst


def _m2_axis_projector_dev(n):
    """P_+ = (I + n.sigma)/2 is a projector: check P^2 = P."""
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    ns = n[0] * X + n[1] * Ymat + n[2] * Z
    Pp = (I2 + ns) / 2
    return dev(Pp @ Pp, Pp)


def _m2_axis_probability(n, theta, phi):
    """p(+) from the projector, against (1 + n.r)/2 from the Bloch vector."""
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    psi = _m2_state(theta, phi)
    ns = n[0] * X + n[1] * Ymat + n[2] * Z
    Pp = (I2 + ns) / 2
    return float(np.real(np.vdot(psi, Pp @ psi)))


def _m2_evolve(H, psi, t):
    return expm(-1j * H * t) @ psi


def _m2_beat(omega, t):
    """P(+) for |+> under H = (omega/2) Z, from the matrices."""
    H = omega * Z / 2
    return abs(inner(KETP, _m2_evolve(H, KETP, t))) ** 2


def _m2_stationary_dev(omega, t):
    """An energy eigenstate differs from itself by a global phase only, so the
    probability of every outcome of every measurement is unchanged."""
    H = omega * Z / 2
    out = _m2_evolve(H, KET0, t)
    return abs(abs(inner(KETP, out)) ** 2 - abs(inner(KETP, KET0)) ** 2)


def _m2_driven_population(omega_x, delta, t):
    """P(1) under H = (Omega_x X + Delta Z)/2, from expm rather than from the
    closed form the scene derives."""
    H = (omega_x * X + delta * Z) / 2
    return abs(inner(KET1, _m2_evolve(H, KET0, t))) ** 2


def _m2_driven_ceiling(omega_x, delta):
    """The largest population the drive ever reaches, found by sampling the
    evolution rather than by quoting (Omega_x/Omega)^2."""
    ts = np.linspace(0.0, 200.0, 400001)
    return max(_m2_driven_population(omega_x, delta, float(t)) for t in ts[::40])


def _m2_standard_error(p, n):
    return math.sqrt(p * (1 - p) / n)



# ── chapter 3 · mixed states and entanglement ───────────────────────────────
#
# Every route below is a second one. The scenes reach a purity from the entries
# of a matrix; here it is read off eigenvalues. The scenes read a reduced state
# off a block structure; here it is the sum over (I (x) <j|) of the definition.
# The scenes apply a channel entry by entry; here the Kraus matrices are
# multiplied out. The scenes assemble a CHSH value from cosines; here the
# four-by-four operators are built and traced against the state.


def _m3_rho_of(psi):
    return proj(np.asarray(psi, dtype=complex))


_M3_MIX = 0.5 * proj(KET0) + 0.5 * proj(KETP)     # the running example of 3.1


def _m3_mean(rho, A):
    return float(np.trace(np.asarray(rho) @ np.asarray(A)).real)


def _m3_mean_by_branches(A):
    """The same expectation value as a classical average over the two branches
    of the preparation, which is the route the scene checks itself by."""
    return 0.5 * float(np.vdot(KET0, A @ KET0).real) \
         + 0.5 * float(np.vdot(KETP, A @ KETP).real)


def _m3_min_eigenvalue(M):
    return float(np.linalg.eigvalsh(np.asarray(M, dtype=complex))[0])


def _m3_purity_from_eigenvalues(rho):
    lam = np.linalg.eigvalsh(np.asarray(rho, dtype=complex))
    return float(sum(l ** 2 for l in lam))


def _m3_damped(gamma, rho=None):
    """|+> through amplitude damping, with the Kraus operators multiplied out
    rather than the two entry rules the scene states applied."""
    return channel(amp_damp(gamma), proj(KETP) if rho is None else rho)


def _m3_damp_coherence(gamma):
    return abs(_m3_damped(gamma)[0, 1])


def _m3_dephased(p):
    return channel(phase_flip(p), proj(KETP))


def _m3_t2_from(t1, tphi):
    return 1.0 / (1.0 / (2.0 * t1) + 1.0 / tphi)


def _m3_reduced(psi, keep=0):
    return partial_trace(proj(np.asarray(psi, dtype=complex)), keep)


_M3_UNEQUAL = np.array([math.sqrt(3) / 2, 0, 0, 0.5], dtype=complex)   # 3.6.2


def _m3_schmidt_by_svd(psi):
    """The Schmidt coefficients through the singular values of the coefficient
    matrix, which is the other of the two routes the chapter gives."""
    C = np.asarray(psi, dtype=complex).reshape(2, 2)
    return np.sort(np.linalg.svd(C, compute_uv=False) ** 2)[::-1]


def _m3_svd_matches_trace(psi):
    """How far the SVD route is from the partial-trace route. Zero is the
    claim the chapter makes when it says the two agree."""
    lam_svd = _m3_schmidt_by_svd(psi)
    lam_tr = np.sort(np.linalg.eigvalsh(_m3_reduced(psi)))[::-1]
    return float(np.max(np.abs(lam_svd - lam_tr)))


def _m3_corr(psi, na, nb):
    """<(n.sigma) (x) (m.sigma)> from the four-by-four operator."""
    M = kron(ndotsigma(na), ndotsigma(nb))
    return float(np.vdot(psi, M @ psi).real)


def _m3_chsh(psi, a0, a1, b0, b1):
    d = [direction(a0), direction(a1), direction(b0), direction(b1)]
    return (_m3_corr(psi, d[0], d[2]) + _m3_corr(psi, d[0], d[3])
            + _m3_corr(psi, d[1], d[2]) - _m3_corr(psi, d[1], d[3]))


def _m3_nosignal(deg):
    """The reduced state of the first qubit after the second is measured along
    `deg` and the outcome is not looked at, minus the reduced state before.
    Zero for every angle is what no signalling says."""
    rho = proj(BELL_PHI_P)
    n = ndotsigma(direction(deg))
    after = np.zeros((4, 4), dtype=complex)
    for sign in (+1, -1):
        P = kron(I2, 0.5 * (I2 + sign * n))
        after += P @ rho @ P
    return dev(partial_trace(after, 0), partial_trace(rho, 0))


def _m3_more_coherence_than_population():
    """The smallest gap between the surviving coherence and the surviving
    population over the whole range of the damping parameter. The figure
    caption claims it is never negative."""
    gs = np.linspace(0.0, 1.0, 2001)
    return min(abs(_m3_damped(float(g))[0, 1]) - _m3_damped(float(g))[1, 1].real
               for g in gs)


def _m3_binary_entropy_max():
    """The largest value of the two-term Schmidt entropy, found by sampling
    rather than by quoting that it sits at one half."""
    best = 0.0
    for l in np.linspace(1e-9, 1 - 1e-9, 200001):
        rho = np.diag([l, 1 - l]).astype(complex)
        best = max(best, von_neumann(rho))
    return best


CHECKS = [
    # ---- 1.1 -----------------------------------------------------------
    {"name": "1.1.1 squared length of (2+i, 1-3i)", "stated": 15.0,
     "derive": _squared_length_symbolic, "rtol": 1e-12},
    {"name": "1.1.1 probability of outcome 0 for that state", "stated": 1 / 3,
     "derive": _prob_zero_of_that_state, "rtol": 1e-12},
    {"name": "1.1.2 overlap of (1,i)/sqrt2 with (1,-i)/sqrt2", "stated": 0.0,
     "derive": _overlap_of_the_two_circular_states, "atol": 1e-12},
    {"name": "1.1.2 the same sum with the conjugate left out", "stated": 1.0,
     "derive": _same_overlap_without_the_conjugate, "rtol": 1e-12},
    {"name": "1.1.3 squared overlap at theta = 0", "stated": 1.0,
     "derive": lambda: _overlap_along_the_family(0.0), "rtol": 1e-10},
    {"name": "1.1.3 squared overlap at theta = pi/2", "stated": 0.5,
     "derive": lambda: _overlap_along_the_family(math.pi / 2), "rtol": 1e-10},
    {"name": "1.1.3 squared overlap at theta = pi", "stated": 0.0,
     "derive": lambda: _overlap_along_the_family(math.pi), "atol": 1e-15},
    {"name": "1.1.4 coefficient of |+> in |0>", "stated": 1 / math.sqrt(2),
     "derive": _coefficient_of_plus_in_zero, "rtol": 1e-12},

    # ---- 1.2 -----------------------------------------------------------
    {"name": "1.2.1 modulus of -1+i", "stated": math.sqrt(2),
     "derive": _modulus_of_minus_one_plus_i, "rtol": 1e-12},
    {"name": "1.2.1 phase of -1+i, in radians", "stated": 3 * math.pi / 4,
     "derive": _phase_of_minus_one_plus_i, "rtol": 1e-12},
    {"name": "1.2.1 what arctan(y/x) returns instead", "stated": -math.pi / 4,
     "derive": _arctan_trap, "rtol": 1e-12},
    {"name": "1.2.2 P(0) after a Hadamard on |+>", "stated": 1.0,
     "derive": lambda: _prob_after_hadamard(KETP), "rtol": 1e-12},
    {"name": "1.2.2 P(0) after a Hadamard on |->", "stated": 0.0,
     "derive": lambda: _prob_after_hadamard(KETM), "atol": 1e-30},

    # ---- 1.3 -----------------------------------------------------------
    {"name": "1.3.1 the (0,1) entry of |0><1|", "stated": 1.0,
     "derive": _outer_zero_one_entry, "rtol": 1e-12},
    {"name": "1.3.1 the norm of (|0><1|) squared", "stated": 0.0,
     "derive": _outer_zero_one_squared_norm, "atol": 1e-15},
    {"name": "1.3.2 length of P|0> for P = |+><+|", "stated": 1 / math.sqrt(2),
     "derive": _length_of_projected_zero, "rtol": 1e-12},
    {"name": "1.3.3 <0|1> by inserting the X basis", "stated": 0.0,
     "derive": _inner_by_inserting_the_x_basis, "atol": 1e-15},

    # ---- 1.4 -----------------------------------------------------------
    {"name": "1.4.1 Gram-Schmidt's second vector, against QR", "stated": 1.0,
     "derive": _gram_schmidt_second_vector_against_qr, "rtol": 1e-12},

    # ---- 1.5 -----------------------------------------------------------
    {"name": "1.5.1 the entry |0> tensor |1> occupies", "stated": 1.0,
     "derive": _index_of_zero_tensor_one, "rtol": 1e-12},
    {"name": "1.5.1 the (0,3) entry of X tensor X", "stated": 1.0,
     "derive": _corner_entry_of_x_tensor_x, "rtol": 1e-12},
    # The scene quotes this to three significant figures, so half a unit in the
    # last of them is the tolerance the printed value actually carries.
    {"name": "1.5.2 amplitudes at fifty qubits", "stated": 1.13e15,
     "derive": _amplitudes_at_fifty_qubits, "rtol": 5e-3},

    # ---- 1.6 -----------------------------------------------------------
    {"name": "1.6.1 [[1,i],[-i,1]] is Hermitian", "stated": 0.0,
     "derive": lambda: hermiticity(C_HERM), "atol": 1e-15},
    {"name": "1.6.2 its larger eigenvalue", "stated": 2.0,
     "derive": lambda: float(_eigs(C_HERM)[-1]), "rtol": 1e-12},
    {"name": "1.6.2 its smaller eigenvalue", "stated": 0.0,
     "derive": lambda: float(_eigs(C_HERM)[0]), "atol": 1e-15},
    {"name": "1.6.2 the rotation's eigenvalues are off the real axis",
     "stated": 1.0, "derive": _rotation_eigenvalue_imaginary_part, "rtol": 1e-12},
    {"name": "1.6.2 and have no real part", "stated": 0.0,
     "derive": _rotation_eigenvalue_real_part, "atol": 1e-15},
    {"name": "1.6.3 the Hadamard is unitary", "stated": 0.0,
     "derive": lambda: unitarity(H), "atol": 1e-15},
    {"name": "1.6.3 the Hadamard is its own inverse", "stated": 0.0,
     "derive": lambda: dev(H @ H, I2), "atol": 1e-15},
    {"name": "1.6.3 (1/sqrt2)[[1,1],[i,-i]] is unitary", "stated": 0.0,
     "derive": lambda: unitarity(U_YBASIS), "atol": 1e-15},
    {"name": "1.6.3 the shear is not, and stretches |1>",
     "stated": math.sqrt(2), "derive": _length_of_sheared_one, "rtol": 1e-12},
    {"name": "1.6.4 closed form against expm, theta = pi/3", "stated": 0.0,
     "derive": lambda: _pauli_closed_form_against_expm(math.pi / 3), "atol": 1e-14},
    {"name": "1.6.4 closed form against expm, theta = 2.4", "stated": 0.0,
     "derive": lambda: _pauli_closed_form_against_expm(2.4), "atol": 1e-14},
    {"name": "1.6.5 a full turn gives minus the identity", "stated": 0.0,
     "derive": _full_turn_is_minus_identity, "atol": 1e-14},
    {"name": "1.6.5 the first phase of R_z(pi/3)", "stated": -math.pi / 6,
     "derive": _rz_third_of_pi_first_phase, "rtol": 1e-12},

    # ---- 1.7 -----------------------------------------------------------
    {"name": "1.7.1 larger eigenvalue of [[2,1],[1,2]]", "stated": 3.0,
     "derive": lambda: float(_eigs(A_SYM)[-1]), "rtol": 1e-12},
    {"name": "1.7.1 smaller eigenvalue of [[2,1],[1,2]]", "stated": 1.0,
     "derive": lambda: float(_eigs(A_SYM)[0]), "rtol": 1e-12},
    {"name": "1.7.2 spectral form reassembles [[2,1],[1,2]]", "stated": 0.0,
     "derive": lambda: _spectral_reassembly(A_SYM), "atol": 1e-14},
    {"name": "1.7.2 its projectors resolve the identity", "stated": 0.0,
     "derive": lambda: _projectors_resolve_the_identity(A_SYM), "atol": 1e-14},
    {"name": "1.7.3 A squared is twice A for [[1,-i],[i,1]]", "stated": 0.0,
     "derive": lambda: _square_is_twice(A_CIRC), "atol": 1e-14},
    {"name": "1.7.3 A/sqrt2 squares back to A", "stated": 0.0,
     "derive": lambda: _square_root_squares_back(A_CIRC), "atol": 1e-14},
    {"name": "1.7.3 spectral exponential against expm, t = 0.7", "stated": 0.0,
     "derive": lambda: _spectral_exponential_against_expm(A_CIRC, 0.7), "atol": 1e-13},
    {"name": "1.7.3 the (0,0) entry of exp(X)", "stated": 1.5431,
     "derive": _exp_of_x_corner, "rtol": 1e-4},
    {"name": "1.7.3 the (0,1) entry of exp(X)", "stated": 1.1752,
     "derive": _exp_of_x_off_diagonal, "rtol": 1e-4},
    {"name": "1.7.3 the entrywise answer has a negative eigenvalue",
     "stated": -1.7183, "derive": _entrywise_exponential_negative_eigenvalue,
     "rtol": 1e-4},

    # ---- 2.1 -----------------------------------------------------------
    {"name": "2.1.1 p(0) for (3, 4i)/5", "stated": 0.36,
     "derive": lambda: _m2_born(np.array([3, 4j], dtype=complex) / 5, KET0),
     "rtol": 1e-12},
    {"name": "2.1.1 p(1) for the same state", "stated": 0.64,
     "derive": lambda: _m2_born(np.array([3, 4j], dtype=complex) / 5, KET1),
     "rtol": 1e-12},
    {"name": "2.1.1 the two probabilities add to one", "stated": 1.0,
     "derive": lambda: sum(_m2_born(np.array([3, 4j], dtype=complex) / 5, k)
                           for k in (KET0, KET1)), "rtol": 1e-12},
    {"name": "2.1.3 best guess probability for orthogonal states", "stated": 1.0,
     "derive": lambda: 0.5 * (1 + math.sin(math.pi / 2)), "rtol": 1e-12},
    {"name": "2.1.3 and for identical states", "stated": 0.5,
     "derive": lambda: 0.5 * (1 + math.sin(0.0)), "rtol": 1e-12},

    # ---- 2.2 -----------------------------------------------------------
    {"name": "2.2.2 p(0) for (1, 2)/sqrt5", "stated": 0.2,
     "derive": lambda: _m2_born(np.array([1, 2], dtype=complex) / math.sqrt(5),
                                KET0), "rtol": 1e-12},
    {"name": "2.2.2 the update rule lands on |0> exactly", "stated": 0.0,
     "derive": lambda: _m2_post_measurement(
         np.array([1, 2], dtype=complex) / math.sqrt(5), KET0), "atol": 1e-14},
    {"name": "2.2.3 a perfect readout reports the truth", "stated": 0.7,
     "derive": lambda: _m2_readout(0.7, 0.0), "rtol": 1e-12},
    {"name": "2.2.3 a readout at eps = 0.05 on q = 0.7", "stated": 0.05 + 0.9 * 0.7,
     "derive": lambda: _m2_readout(0.7, 0.05), "rtol": 1e-12},
    {"name": "2.2.3 at eps = 1/2 it reports one half whatever q is",
     "stated": 0.5, "derive": lambda: _m2_readout(0.83, 0.5), "rtol": 1e-12},

    # ---- 2.3 -----------------------------------------------------------
    {"name": "2.3.1 <Z> for (2, 1)/sqrt5", "stated": 0.6,
     "derive": lambda: _m2_expectation(
         Z, np.array([2, 1], dtype=complex) / math.sqrt(5)), "rtol": 1e-12},
    {"name": "2.3.2 Var(Z) on |+>", "stated": 1.0,
     "derive": lambda: _m2_variance(Z, KETP), "rtol": 1e-12},
    {"name": "2.3.2 Var(Z) on |0>", "stated": 0.0,
     "derive": lambda: _m2_variance(Z, KET0), "atol": 1e-15},

    # ---- 2.4 -----------------------------------------------------------
    {"name": "2.4.1 [X, Z] = -2iY", "stated": 0.0,
     "derive": lambda: _m2_commutator_dev(
         X, Z, -2j * np.array([[0, -1j], [1j, 0]], dtype=complex)),
     "atol": 1e-15},
    {"name": "2.4.2 the Robertson bound is met at theta = pi/2, phi = pi/4",
     "stated": 0.0,
     "derive": lambda: (
         math.sqrt(_m2_variance(X, _m2_state(math.pi / 2, math.pi / 4)))
         * math.sqrt(_m2_variance(Z, _m2_state(math.pi / 2, math.pi / 4)))
         - abs(_m2_expectation(np.array([[0, -1j], [1j, 0]], dtype=complex),
                               _m2_state(math.pi / 2, math.pi / 4)))),
     "atol": 1e-12},
    {"name": "2.4.2 the bound vanishes on |0>", "stated": 0.0,
     "derive": lambda: abs(_m2_expectation(
         np.array([[0, -1j], [1j, 0]], dtype=complex), KET0)), "atol": 1e-15},

    # ---- 2.5 -----------------------------------------------------------
    {"name": "2.5.1 every Pauli squares to the identity", "stated": 0.0,
     "derive": lambda: max(dev(M @ M, I2) for M in
                           (X, np.array([[0, -1j], [1j, 0]], dtype=complex), Z)),
     "atol": 1e-15},
    {"name": "2.5.1 every Pauli is traceless", "stated": 0.0,
     "derive": lambda: max(abs(complex(np.trace(M))) for M in
                           (X, np.array([[0, -1j], [1j, 0]], dtype=complex), Z)),
     "atol": 1e-15},
    {"name": "2.5.1 every Pauli has eigenvalues +1 and -1", "stated": 0.0,
     "derive": lambda: max(abs(abs(float(l)) - 1.0)
                           for M in (X, np.array([[0, -1j], [1j, 0]], dtype=complex), Z)
                           for l in np.linalg.eigvalsh(M)), "atol": 1e-14},
    {"name": "2.5.2 the cyclic product rule, on all nine ordered pairs",
     "stated": 0.0, "derive": _m2_pauli_product_dev, "atol": 1e-15},
    {"name": "2.5.3 (I + n.sigma)/2 is a projector", "stated": 0.0,
     "derive": lambda: _m2_axis_projector_dev(
         np.array([0.6, 0.0, 0.8])), "atol": 1e-15},
    {"name": "2.5.3 p(+) along z for |0> is one", "stated": 1.0,
     "derive": lambda: _m2_axis_probability(
         np.array([0.0, 0.0, 1.0]), 0.0, 0.0), "rtol": 1e-12},
    {"name": "2.5.3 p(+) at sixty degrees off the state", "stated": 0.75,
     "derive": lambda: _m2_axis_probability(
         np.array([math.sin(math.pi / 3), 0.0, math.cos(math.pi / 3)]), 0.0, 0.0),
     "rtol": 1e-12},

    # ---- 2.6 -----------------------------------------------------------
    {"name": "2.6.1 P(0) under H = (omega/2)Z is one half for all t",
     "stated": 0.5,
     "derive": lambda: abs(inner(KET0, _m2_evolve(Z / 2, KETP, 1.7))) ** 2,
     "rtol": 1e-12},
    {"name": "2.6.2 an energy eigenstate is stationary", "stated": 0.0,
     "derive": lambda: _m2_stationary_dev(1.0, 3.3), "atol": 1e-14},
    {"name": "2.6.2 the beat returns at omega t = 2 pi", "stated": 1.0,
     "derive": lambda: _m2_beat(1.0, 2 * math.pi), "rtol": 1e-10},
    {"name": "2.6.2 and vanishes at omega t = pi", "stated": 0.0,
     "derive": lambda: _m2_beat(1.0, math.pi), "atol": 1e-25},
    {"name": "2.6.3 a resonant pi pulse flips the qubit", "stated": 1.0,
     "derive": lambda: _m2_driven_population(1.0, 0.0, math.pi), "rtol": 1e-10},
    {"name": "2.6.3 the ceiling at equal drive and detuning", "stated": 0.5,
     "derive": lambda: _m2_driven_ceiling(1.0, 1.0), "rtol": 1e-4},

    # ---- 2.7 -----------------------------------------------------------
    {"name": "2.7.1 standard error at p = 1/2 and N = 1000", "stated": 0.0158,
     "derive": lambda: _m2_standard_error(0.5, 1000), "rtol": 2e-3},
    {"name": "2.7.1 the worst case is 1/(2 sqrt N)", "stated": 0.0,
     "derive": lambda: abs(_m2_standard_error(0.5, 4096) - 1 / (2 * 64)),
     "atol": 1e-15},

    # ---- 3.1 -----------------------------------------------------------
    {"name": "3.1.1 the coherence of (|0> + i|1>)/sqrt2 is -i/2", "stated": -0.5,
     "derive": lambda: _m3_rho_of((KET0 + 1j * KET1) / math.sqrt(2))[0, 1].imag,
     "rtol": 1e-12},
    {"name": "3.1.1 a pure state satisfies rho^2 = rho", "stated": 0.0,
     "derive": lambda: dev(_m3_rho_of((KET0 + 1j * KET1) / math.sqrt(2)) @
                           _m3_rho_of((KET0 + 1j * KET1) / math.sqrt(2)),
                           _m3_rho_of((KET0 + 1j * KET1) / math.sqrt(2))),
     "atol": 1e-14},
    {"name": "3.1.2 the failing eigenvalue of [[.5,.8],[.8,.5]]", "stated": -0.3,
     "derive": lambda: _m3_min_eigenvalue([[0.5, 0.8], [0.8, 0.5]]), "rtol": 1e-12},
    {"name": "3.1.2 the coherence a fair diagonal allows", "stated": 0.5,
     "derive": lambda: math.sqrt(0.5 * 0.5), "rtol": 1e-15},
    {"name": "3.1.3 <Z> of the running mixture", "stated": 0.5,
     "derive": lambda: _m3_mean(_M3_MIX, Z), "rtol": 1e-12},
    {"name": "3.1.3 <X> of the running mixture", "stated": 0.5,
     "derive": lambda: _m3_mean(_M3_MIX, X), "rtol": 1e-12},
    {"name": "3.1.3 <Y> of the running mixture", "stated": 0.0,
     "derive": lambda: _m3_mean(_M3_MIX, Y), "atol": 1e-15},
    {"name": "3.1.3 the trace route and the branch route agree", "stated": 0.0,
     "derive": lambda: abs(_m3_mean(_M3_MIX, Z) - _m3_mean_by_branches(Z)),
     "atol": 1e-15},
    {"name": "3.1.4 the two ensembles of I/2 are one operator", "stated": 0.0,
     "derive": lambda: dev(0.5 * proj(KET0) + 0.5 * proj(KET1),
                           0.5 * proj(KETP) + 0.5 * proj(KETM)),
     "atol": 1e-15},

    # ---- 3.2 -----------------------------------------------------------
    {"name": "3.2.1 purity of the running mixture", "stated": 0.75,
     "derive": lambda: _m3_purity_from_eigenvalues(_M3_MIX), "rtol": 1e-12},
    {"name": "3.2.1 its larger eigenvalue", "stated": 0.854,
     "derive": lambda: float(np.linalg.eigvalsh(_M3_MIX)[1]), "rtol": 1e-3},
    # The scene quotes both eigenvalues to three decimal places, so the
    # tolerance here is the rounding that quotation allows and no more:
    # 0.0005 against 0.146 is 3.4e-3.
    {"name": "3.2.1 its smaller eigenvalue", "stated": 0.146,
     "derive": lambda: float(np.linalg.eigvalsh(_M3_MIX)[0]), "rtol": 3.5e-3},
    {"name": "3.2.2 the length of its Bloch vector", "stated": math.sqrt(0.5),
     "derive": lambda: float(np.linalg.norm(bloch(_M3_MIX))), "rtol": 1e-12},
    {"name": "3.2.2 purity from the length agrees with Tr rho^2", "stated": 0.0,
     "derive": lambda: abs(0.5 * (1 + float(np.linalg.norm(bloch(_M3_MIX))) ** 2)
                           - purity(_M3_MIX)),
     "atol": 1e-14},

    # ---- 3.3 -----------------------------------------------------------
    {"name": "3.3.1 the damping Kraus operators are complete", "stated": 0.0,
     "derive": lambda: dev(sum(K.conj().T @ K for K in amp_damp(0.37)), I2),
     "atol": 1e-15},
    {"name": "3.3.2 the coherence of |+> after half damping", "stated": 0.3536,
     "derive": lambda: _m3_damp_coherence(0.5), "rtol": 2e-4},
    {"name": "3.3.2 the purity of |+> after half damping", "stated": 0.875,
     "derive": lambda: purity(_m3_damped(0.5)), "rtol": 1e-12},
    {"name": "3.3.2 full damping sends every state to |0>", "stated": 0.0,
     "derive": lambda: dev(_m3_damped(1.0, _M3_MIX), proj(KET0)), "atol": 1e-14},
    {"name": "3.3.2 the coherence never falls below the population",
     "stated": 0.0, "derive": _m3_more_coherence_than_population, "atol": 5e-4},
    {"name": "3.3.3 dephasing multiplies the coherence by 1 - 2p",
     "stated": 0.25,
     "derive": lambda: abs(_m3_dephased(0.25)[0, 1]), "rtol": 1e-12},
    {"name": "3.3.3 at p = 1/2 what is left is the diagonal part", "stated": 0.0,
     "derive": lambda: dev(_m3_dephased(0.5), np.diag(np.diag(proj(KETP)))),
     "atol": 1e-15},
    {"name": "3.3.3 at p = 1 the channel is the gate Z", "stated": 0.0,
     "derive": lambda: dev(_m3_dephased(1.0), Z @ proj(KETP) @ Z), "atol": 1e-15},

    # ---- 3.4 -----------------------------------------------------------
    {"name": "3.4.1 T2 = 1.5 T1 needs a pure dephasing time of 6 T1",
     "stated": 1.5, "derive": lambda: _m3_t2_from(1.0, 6.0), "rtol": 1e-12},
    {"name": "3.4.1 with no pure dephasing T2 is exactly 2 T1", "stated": 2.0,
     "derive": lambda: _m3_t2_from(1.0, 1e12), "rtol": 1e-11},

    # ---- 3.5 -----------------------------------------------------------
    {"name": "3.5.2 the reduced state of a Bell pair is I/2", "stated": 0.0,
     "derive": lambda: dev(_m3_reduced(BELL_PHI_P), I2 / 2), "atol": 1e-15},
    {"name": "3.5.3 the Bell pair itself is pure", "stated": 1.0,
     "derive": lambda: purity(proj(BELL_PHI_P)), "rtol": 1e-12},
    {"name": "3.5.3 each half has purity one half", "stated": 0.5,
     "derive": lambda: purity(_m3_reduced(BELL_PHI_P)), "rtol": 1e-12},
    {"name": "3.5.3 a product pair has a pure half", "stated": 1.0,
     "derive": lambda: purity(_m3_reduced(np.kron(KETP, KET0))), "rtol": 1e-12},

    # ---- 3.6 -----------------------------------------------------------
    {"name": "3.6.1 the four equal amplitudes are |+> (x) |+>", "stated": 0.0,
     "derive": lambda: float(np.linalg.norm(
         np.full(4, 0.5, dtype=complex) - np.kron(KETP, KETP))),
     "atol": 1e-15},
    {"name": "3.6.1 the separability determinant of a Bell state", "stated": 0.5,
     "derive": lambda: abs(BELL_PHI_P[0] * BELL_PHI_P[3]
                           - BELL_PHI_P[1] * BELL_PHI_P[2]),
     "rtol": 1e-12},
    {"name": "3.6.2 the larger Schmidt coefficient of the lopsided pair",
     "stated": 0.75,
     "derive": lambda: float(np.linalg.eigvalsh(_m3_reduced(_M3_UNEQUAL))[1]),
     "rtol": 1e-12},
    {"name": "3.6.2 the purity of its reduced state", "stated": 0.625,
     "derive": lambda: purity(_m3_reduced(_M3_UNEQUAL)), "rtol": 1e-12},
    {"name": "3.6.3 the SVD route and the partial trace agree", "stated": 0.0,
     "derive": lambda: _m3_svd_matches_trace(_M3_UNEQUAL), "atol": 1e-14},

    # ---- 3.7 -----------------------------------------------------------
    {"name": "3.7.1 the entropy of the lopsided pair, in bits", "stated": 0.811,
     "derive": lambda: von_neumann(_m3_reduced(_M3_UNEQUAL)), "rtol": 1e-3},
    {"name": "3.7.1 a Bell pair carries one ebit", "stated": 1.0,
     "derive": lambda: von_neumann(_m3_reduced(BELL_PHI_P)), "rtol": 1e-12},
    {"name": "3.7.1 a product pair carries none", "stated": 0.0,
     "derive": lambda: von_neumann(_m3_reduced(np.kron(KETP, KET0))),
     "atol": 1e-9},
    {"name": "3.7.1 one bit is the most two qubits can carry", "stated": 1.0,
     "derive": _m3_binary_entropy_max, "rtol": 1e-8},

    # ---- 3.8 -----------------------------------------------------------
    {"name": "3.8.1 <X (x) X> on the Bell state", "stated": 1.0,
     "derive": lambda: float(np.vdot(BELL_PHI_P,
                                     kron(X, X) @ BELL_PHI_P).real),
     "rtol": 1e-12},
    {"name": "3.8.1 <Y (x) Y> on the Bell state", "stated": -1.0,
     "derive": lambda: float(np.vdot(BELL_PHI_P,
                                     kron(Y, Y) @ BELL_PHI_P).real),
     "rtol": 1e-12},
    {"name": "3.8.1 <Z (x) Z> on the Bell state", "stated": 1.0,
     "derive": lambda: float(np.vdot(BELL_PHI_P,
                                     kron(Z, Z) @ BELL_PHI_P).real),
     "rtol": 1e-12},
    {"name": "3.8.1 <X (x) X> on the classical mixture", "stated": 0.0,
     "derive": lambda: float(np.trace(
         (0.5 * proj(np.array([1, 0, 0, 0], dtype=complex))
          + 0.5 * proj(np.array([0, 0, 0, 1], dtype=complex)))
         @ kron(X, X)).real),
     "atol": 1e-15},
    {"name": "3.8.3 the CHSH value at the four stated directions",
     "stated": 2 * math.sqrt(2),
     "derive": lambda: _m3_chsh(BELL_PHI_P, 0.0, 90.0, 45.0, -45.0),
     "rtol": 1e-12},
    {"name": "3.8.3 the caption's symmetric family peaks at 45 degrees",
     "stated": 2 * math.sqrt(2),
     "derive": lambda: max(_m3_chsh(BELL_PHI_P, 0.0, 90.0, f, -f)
                           for f in np.linspace(0.0, 90.0, 9001)),
     "rtol": 1e-6},
    {"name": "3.8.4 no local measurement moves the other reduced state",
     "stated": 0.0,
     "derive": lambda: max(_m3_nosignal(float(d))
                           for d in np.linspace(0.0, 180.0, 181)),
     "atol": 1e-14},
]


if __name__ == "__main__":
    main(CHECKS, "verify_scenes — chapters 1 to 3, teaching scenes")
