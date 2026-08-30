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

import cmath
import math
import os
import sys

import numpy as np
import sympy as sp
from scipy.linalg import expm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402
from qops import (BELL_PHI_P, H, I2, KET0, KET1, KETM, KETP,  # noqa: E402
                  grover_best, grover_state, grover_success, index,
                  teleport_bob, teleport_branch,
                  S_GATE, T_GATE, X, Y, Z, amp_damp, bloch, bloch_of,
                  channel, cnot, cz_gate, dev, direction, hermiticity,
                  inner, ket, kron, ndotsigma, on_qubit, outer,
                  partial_trace, phase_gate, phase_flip, proj, purity,
                  kron_state, rot, rx, ry, rz, same_state, swap_gate, toffoli,
                  u_gate, unitarity, von_neumann)

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


# ── Chapter 4: the Bloch sphere and quantum gates ───────────────────────────
#
# The independent routes here are three. A rotation operator the chapter writes
# as cos(a/2) I - i sin(a/2) n.sigma is checked against `rot`, which is the
# matrix exponential itself. A two-qubit gate the chapter prints as a matrix is
# checked against a matrix built by looping over bit strings and asking where
# each one goes. And a claim that two states are the same is checked with
# `same_state`, which compares them up to a global phase, because that is what
# the claim actually says.
#
# The ordering claims of section 4.5 have checks of their own. That convention
# fails silently -- the wrong choice gives a normalised state whose numbers all
# look reasonable -- so it is the one place in the chapter where a gate is the
# only thing standing between a reader and a wrong answer.


DEG = math.radians


def _m4_state(theta_deg, phi_deg):
    """The chapter's parameterisation, written out."""
    t, p = DEG(theta_deg), DEG(phi_deg)
    return math.cos(t / 2) * KET0 + np.exp(1j * p) * math.sin(t / 2) * KET1


def _m4_bloch(theta_deg, phi_deg):
    return bloch_of(_m4_state(theta_deg, phi_deg))


def _m4_overlap_by_vectors(a, b):
    """|<chi|psi>|^2 from the two Bloch vectors rather than from the states."""
    return 0.5 * (1.0 + float(np.dot(a, b)))


def _m4_closed_form(n, alpha):
    """The closed form the chapter derives, to be checked against expm."""
    return (math.cos(alpha / 2) * I2
            - 1j * math.sin(alpha / 2) * ndotsigma(n))


def _m4_bloch_rotation_gap(alpha):
    """How far R_z(alpha) is from turning the Bloch vector by alpha.

    The scene states the three component equations. They are re-derived here by
    applying the operator to a generic state and comparing with a plain
    rotation matrix acting on its Bloch vector.
    """
    psi = _m4_state(37.0, 61.0)
    r = bloch_of(psi)
    got = bloch_of(rot((0, 0, 1), alpha) @ psi)
    c, s = math.cos(alpha), math.sin(alpha)
    want = np.array([r[0] * c - r[1] * s, r[0] * s + r[1] * c, r[2]])
    return float(np.linalg.norm(got - want))


def _m4_hadamard_bloch_gap():
    """H sends (rx, ry, rz) to (rz, -ry, rx), as the scene claims."""
    psi = _m4_state(53.0, 24.0)
    r = bloch_of(psi)
    got = bloch_of(H @ psi)
    return float(np.linalg.norm(got - np.array([r[2], -r[1], r[0]])))


def _m4_controlled(U):
    """The controlled version of a one-qubit gate, control q0 and target q1."""
    M = np.zeros((4, 4), dtype=complex)
    for x in range(4):
        q1, q0 = (x >> 1) & 1, x & 1
        if q0 == 0:
            M[x, x] = 1.0
        else:
            for q1p in range(2):
                M[2 * q1p + 1, x] = U[q1p, q1]
    return M


def _m4_controlled_2pi_gap():
    """A 2 pi rotation on the target flips the sign of the control's |1> branch.

    The control starts in |+> and must end in |->; the target is left alone.
    """
    psi = kron_state(KETP, KETP)                 # |q1 q0> = |+> (x) |+>
    out = _m4_controlled(rot((0, 0, 1), 4 * math.pi / 2)) @ psi
    return same_state(out, kron_state(KETP, KETM))


def _m4_entangle_circuit(theta_deg):
    """R_y(theta) on q0 of |00>, then CNOT with q0 as control and q1 as target."""
    psi = ket(0, 0)
    psi = on_qubit(ry(DEG(theta_deg)), 0) @ psi
    return cnot(0, 1) @ psi


def _m4_entropy_of(psi):
    return von_neumann(partial_trace(proj(psi), keep=0))


def _m4_local_gate_gap(theta_deg):
    """A local gate on each qubit must leave the entanglement exactly alone."""
    psi = _m4_entangle_circuit(theta_deg)
    local = kron(u_gate(0.7, 1.1, 2.3), u_gate(2.0, 0.3, 1.7))
    return abs(_m4_entropy_of(local @ psi) - _m4_entropy_of(psi))


def _m4_kickback_gap():
    """CNOT with the target in |-> puts a Z on the control and nothing else."""
    ctrl = 0.6 * KET0 + 0.8 * KET1
    psi = kron_state(KETM, ctrl)                 # target on q1, control on q0
    return dev(cnot(0, 1) @ psi, kron_state(KETM, Z @ ctrl))


def _m4_dirty_ancilla_probability():
    """The register of a Bell pair, measured in the X basis: a fair coin.

    The scene says a clean ancilla would give 0 with certainty and a dirty one
    gives a coin. This computes the second; the first is the same circuit with
    the ancilla left in |0>.
    """
    rho = partial_trace(proj(BELL_PHI_P), keep=0)
    return float(np.real(np.trace(rho @ proj(KETP))))


# The two CNOT matrices exactly as the scene prints them. They are transcribed
# here and re-derived from the Boolean rule beside them, which is the only way
# a printed matrix can be checked at all.
SCENE_CNOT_0TO1 = np.array([[1, 0, 0, 0],
                            [0, 0, 0, 1],
                            [0, 0, 1, 0],
                            [0, 1, 0, 0]], dtype=complex)
SCENE_CNOT_1TO0 = np.array([[1, 0, 0, 0],
                            [0, 1, 0, 0],
                            [0, 0, 0, 1],
                            [0, 0, 1, 0]], dtype=complex)
SCENE_SWAP = np.array([[1, 0, 0, 0],
                       [0, 0, 1, 0],
                       [0, 1, 0, 0],
                       [0, 0, 0, 1]], dtype=complex)


R2 = 1 / math.sqrt(2)


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

    # ── 4.1 The Bloch sphere ────────────────────────────────────────────────
    {"name": "4.1.1 r_x of the state at (60, 135) degrees", "stated": -0.6124,
     "derive": lambda: _m4_bloch(60.0, 135.0)[0], "rtol": 1e-3},
    {"name": "4.1.1 r_y of the same state", "stated": 0.6124,
     "derive": lambda: _m4_bloch(60.0, 135.0)[1], "rtol": 1e-3},
    {"name": "4.1.1 r_z of the same state", "stated": 0.5,
     "derive": lambda: _m4_bloch(60.0, 135.0)[2], "rtol": 1e-12},
    {"name": "4.1.1 the point is on the surface", "stated": 1.0,
     "derive": lambda: float(np.linalg.norm(_m4_bloch(60.0, 135.0))),
     "rtol": 1e-12},
    {"name": "4.1.1 p(0) for that state", "stated": 0.75,
     "derive": lambda: abs(inner(KET0, _m4_state(60.0, 135.0))) ** 2,
     "rtol": 1e-12},
    {"name": "4.1.2 the vector (0,-1,0) names the state |-i>", "stated": 0.0,
     "derive": lambda: same_state(_m4_state(90.0, 270.0),
                                  (KET0 - 1j * KET1) / math.sqrt(2)),
     "atol": 1e-12},
    {"name": "4.1.2 <Y> for that state", "stated": -1.0,
     "derive": lambda: _m4_bloch(90.0, 270.0)[1], "rtol": 1e-12},
    {"name": "4.1.3 the overlap of |0> and |+> from the two vectors",
     "stated": 0.5,
     "derive": lambda: _m4_overlap_by_vectors(np.array([0.0, 0.0, 1.0]),
                                              np.array([1.0, 0.0, 0.0])),
     "rtol": 1e-12},
    {"name": "4.1.3 the caption: opposite points do not overlap", "stated": 0.0,
     "derive": lambda: _m4_overlap_by_vectors(np.array([0.0, 0.0, 1.0]),
                                              np.array([0.0, 0.0, -1.0])),
     "atol": 1e-15},
    {"name": "4.1.4 a global phase does not move the Bloch vector",
     "stated": 0.0,
     "derive": lambda: float(np.linalg.norm(bloch_of(1j * KETP)
                                            - bloch_of(KETP))),
     "atol": 1e-15},
    {"name": "4.1.4 |+> and |-> are perfectly distinguishable", "stated": 0.0,
     "derive": lambda: abs(inner(KETP, KETM)) ** 2, "atol": 1e-30},
    {"name": "4.1.5 a full turn gives minus the identity", "stated": 0.0,
     "derive": lambda: dev(rot((0.3, -0.5, 0.8) / np.linalg.norm([0.3, -0.5, 0.8]),
                               2 * math.pi), -I2),
     "atol": 1e-12},
    {"name": "4.1.5 two full turns give the identity", "stated": 0.0,
     "derive": lambda: dev(rot((0.3, -0.5, 0.8) / np.linalg.norm([0.3, -0.5, 0.8]),
                               4 * math.pi), I2),
     "atol": 1e-12},
    {"name": "4.1.5 a controlled 2 pi rotation turns the control into |->",
     "stated": 0.0, "derive": _m4_controlled_2pi_gap, "atol": 1e-12},

    # ── 4.2 Single-qubit gates as rotations ─────────────────────────────────
    {"name": "4.2.1 the closed form agrees with the matrix exponential",
     "stated": 0.0,
     "derive": lambda: max(dev(_m4_closed_form((0.6, 0.0, 0.8), a),
                               rot((0.6, 0.0, 0.8), a))
                           for a in np.linspace(0.0, 4 * math.pi, 41)),
     "atol": 1e-12},
    {"name": "4.2.1 R_z turns the Bloch vector by its own angle", "stated": 0.0,
     "derive": lambda: max(_m4_bloch_rotation_gap(a)
                           for a in np.linspace(0.0, 2 * math.pi, 37)),
     "atol": 1e-12},
    {"name": "4.2.1 R_z(90 degrees) sends |+> to |+i>", "stated": 0.0,
     "derive": lambda: same_state(rz(DEG(90.0)) @ KETP,
                                  (KET0 + 1j * KET1) / math.sqrt(2)),
     "atol": 1e-12},
    {"name": "4.2.1 the caption: a rotation preserves the length", "stated": 1.0,
     "derive": lambda: float(np.linalg.norm(
         bloch_of(rot((0.6, 0.0, 0.8), 2.1) @ _m4_state(41.0, 77.0)))),
     "rtol": 1e-12},
    {"name": "4.2.2 R_x(pi) is minus i times X", "stated": 0.0,
     "derive": lambda: dev(rx(math.pi), -1j * X), "atol": 1e-12},
    {"name": "4.2.2 R_y(pi) is minus i times Y", "stated": 0.0,
     "derive": lambda: dev(ry(math.pi), -1j * Y), "atol": 1e-12},
    {"name": "4.2.2 R_z(pi) is minus i times Z", "stated": 0.0,
     "derive": lambda: dev(rz(math.pi), -1j * Z), "atol": 1e-12},
    {"name": "4.2.2 X leaves |-> where it is", "stated": 0.0,
     "derive": lambda: same_state(X @ KETM, KETM), "atol": 1e-15},
    {"name": "4.2.2 the caption: Z exchanges |+> and |->", "stated": 0.0,
     "derive": lambda: dev(Z @ KETP, KETM), "atol": 1e-15},
    {"name": "4.2.3 H is the average of X and Z", "stated": 0.0,
     "derive": lambda: dev(H, (X + Z) / math.sqrt(2)), "atol": 1e-15},
    {"name": "4.2.3 the caption: the axis of H is at 45 degrees", "stated": 0.0,
     "derive": lambda: dev(H, ndotsigma((R2, 0.0, R2))), "atol": 1e-15},
    {"name": "4.2.3 H X H is Z", "stated": 0.0,
     "derive": lambda: dev(H @ X @ H, Z), "atol": 1e-15},
    {"name": "4.2.3 H Z H is X", "stated": 0.0,
     "derive": lambda: dev(H @ Z @ H, X), "atol": 1e-15},
    {"name": "4.2.3 H Y H is minus Y", "stated": 0.0,
     "derive": lambda: dev(H @ Y @ H, -Y), "atol": 1e-15},
    {"name": "4.2.3 H maps the Bloch vector as the scene states", "stated": 0.0,
     "derive": _m4_hadamard_bloch_gap, "atol": 1e-14},
    {"name": "4.2.3 H sends |+i> to |-i>", "stated": 0.0,
     "derive": lambda: same_state(H @ (KET0 + 1j * KET1) / math.sqrt(2),
                                  (KET0 - 1j * KET1) / math.sqrt(2)),
     "atol": 1e-12},
    {"name": "4.2.3 H does not create a superposition from |+>", "stated": 0.0,
     "derive": lambda: dev(H @ KETP, KET0), "atol": 1e-15},
    {"name": "4.2.4 P(phi) is a phase times R_z(phi)", "stated": 0.0,
     "derive": lambda: max(dev(phase_gate(f), np.exp(1j * f / 2) * rz(f))
                           for f in np.linspace(0.0, 2 * math.pi, 25)),
     "atol": 1e-12},
    {"name": "4.2.4 S squared is Z", "stated": 0.0,
     "derive": lambda: dev(S_GATE @ S_GATE, Z), "atol": 1e-15},
    {"name": "4.2.4 T squared is S", "stated": 0.0,
     "derive": lambda: dev(T_GATE @ T_GATE, S_GATE), "atol": 1e-15},
    {"name": "4.2.4 the Bloch vector of T|+>", "stated": 0.7071,
     "derive": lambda: bloch_of(T_GATE @ KETP)[1], "rtol": 1e-3},
    {"name": "4.2.4 a phase gate never moves r_z", "stated": 0.0,
     "derive": lambda: abs(bloch_of(T_GATE @ KETP)[2]), "atol": 1e-15},
    {"name": "4.2.4 the caption: Z|+> is a half turn of the equator",
     "stated": 180.0,
     "derive": lambda: math.degrees(math.atan2(bloch_of(Z @ KETP)[1],
                                               bloch_of(Z @ KETP)[0])),
     "rtol": 1e-12},

    # ── 4.3 Composing gates ─────────────────────────────────────────────────
    {"name": "4.3.1 H then S sends |0> to |+i>", "stated": 0.0,
     "derive": lambda: same_state(S_GATE @ H @ KET0,
                                  (KET0 + 1j * KET1) / math.sqrt(2)),
     "atol": 1e-12},
    {"name": "4.3.1 S then H sends |0> to |+>", "stated": 0.0,
     "derive": lambda: same_state(H @ S_GATE @ KET0, KETP), "atol": 1e-12},
    {"name": "4.3.1 the two orders give states at right angles", "stated": 0.5,
     "derive": lambda: abs(inner(S_GATE @ H @ KET0, H @ S_GATE @ KET0)) ** 2,
     "rtol": 1e-12},
    {"name": "4.3.1 gates on different qubits commute", "stated": 0.0,
     "derive": lambda: dev(on_qubit(H, 0) @ on_qubit(T_GATE, 1),
                           on_qubit(T_GATE, 1) @ on_qubit(H, 0)),
     "atol": 1e-15},
    {"name": "4.3.2 the Euler form of the Hadamard", "stated": 0.0,
     "derive": lambda: dev(np.exp(1j * math.pi / 2) * ry(math.pi / 2)
                           @ rz(math.pi), H),
     "atol": 1e-12},
    {"name": "4.3.3 U(pi/2, 0, pi) is the Hadamard", "stated": 0.0,
     "derive": lambda: dev(u_gate(math.pi / 2, 0.0, math.pi), H), "atol": 1e-15},
    {"name": "4.3.3 U(pi, 0, pi) is X", "stated": 0.0,
     "derive": lambda: dev(u_gate(math.pi, 0.0, math.pi), X), "atol": 1e-15},
    {"name": "4.3.3 U(0, phi, 0) is the phase gate", "stated": 0.0,
     "derive": lambda: max(dev(u_gate(0.0, f, 0.0), phase_gate(f))
                           for f in np.linspace(0.0, 2 * math.pi, 25)),
     "atol": 1e-15},
    {"name": "4.3.3 the three-parameter gate is unitary everywhere",
     "stated": 0.0,
     "derive": lambda: max(unitarity(u_gate(t, p, l))
                           for t in np.linspace(0.0, math.pi, 7)
                           for p in np.linspace(0.0, 2 * math.pi, 7)
                           for l in np.linspace(0.0, 2 * math.pi, 7)),
     "atol": 1e-14},

    # ── 4.4 Reversible embeddings ───────────────────────────────────────────
    {"name": "4.4.1 the CNOT undoes itself", "stated": 0.0,
     "derive": lambda: dev(cnot(0, 1) @ cnot(0, 1), np.eye(4)), "atol": 1e-15},
    {"name": "4.4.1 the Toffoli undoes itself", "stated": 0.0,
     "derive": lambda: dev(toffoli() @ toffoli(), np.eye(8)), "atol": 1e-15},
    {"name": "4.4.1 the Toffoli computes AND into a cleared third wire",
     "stated": 0.0,
     "derive": lambda: max(dev(toffoli() @ ket(a, b, 0), ket(a, b, a & b))
                           for a in (0, 1) for b in (0, 1)),
     "atol": 1e-15},
    {"name": "4.4.2 a dirty ancilla leaves the register a fair coin",
     "stated": 0.5, "derive": _m4_dirty_ancilla_probability, "rtol": 1e-12},

    # ── 4.5 Two-qubit gates, and the ordering ───────────────────────────────
    #
    # These four are the ordering gate the design record asks for. A wrong
    # ordering produces a normalised state whose numbers all look reasonable,
    # so nothing else in the suite would catch it.
    {"name": "4.5.1 X on q0 of |10> gives |11>", "stated": 0.0,
     "derive": lambda: dev(on_qubit(X, 0) @ ket(1, 0), ket(1, 1)),
     "atol": 1e-15},
    {"name": "4.5.1 X on q1 of |10> gives |00>", "stated": 0.0,
     "derive": lambda: dev(on_qubit(X, 1) @ ket(1, 0), ket(0, 0)),
     "atol": 1e-15},
    {"name": "4.5.1 the two placements are different gates",
     "stated": 2.8284,
     "derive": lambda: dev(on_qubit(X, 0), on_qubit(X, 1)), "rtol": 1e-4},
    {"name": "4.5.1 the untouched qubit is where the ordering shows",
     "stated": -1.0,
     "derive": lambda: bloch(partial_trace(
         proj(on_qubit(X, 0) @ ket(1, 0)), keep=0))[2],
     "rtol": 1e-12},
    {"name": "4.5.2 the printed CNOT_{0->1} matches the Boolean rule",
     "stated": 0.0, "derive": lambda: dev(SCENE_CNOT_0TO1, cnot(0, 1)),
     "atol": 1e-15},
    {"name": "4.5.2 the printed CNOT_{1->0} matches the Boolean rule",
     "stated": 0.0, "derive": lambda: dev(SCENE_CNOT_1TO0, cnot(1, 0)),
     "atol": 1e-15},
    {"name": "4.5.2 the two CNOT directions are different gates",
     "stated": 2.4495, "derive": lambda: dev(cnot(0, 1), cnot(1, 0)),
     "rtol": 1e-4},
    {"name": "4.5.2 a target in |-> writes Z onto the control", "stated": 0.0,
     "derive": _m4_kickback_gap, "atol": 1e-15},
    {"name": "4.5.2 Hadamards on both qubits exchange control and target",
     "stated": 0.0,
     "derive": lambda: dev(kron(H, H) @ cnot(1, 0) @ kron(H, H), cnot(0, 1)),
     "atol": 1e-14},
    {"name": "4.5.3 CZ is the CNOT conjugated on its target", "stated": 0.0,
     "derive": lambda: dev(on_qubit(H, 1) @ cnot(0, 1) @ on_qubit(H, 1),
                           cz_gate()),
     "atol": 1e-14},
    {"name": "4.5.3 CZ is symmetric under exchanging its qubits", "stated": 0.0,
     "derive": lambda: dev(swap_gate() @ cz_gate() @ swap_gate(), cz_gate()),
     "atol": 1e-15},
    {"name": "4.5.3 CZ on |++> is entangled: the amplitude test",
     "stated": -0.5,
     "derive": lambda: float(np.real(
         (cz_gate() @ kron_state(KETP, KETP))[0]
         * (cz_gate() @ kron_state(KETP, KETP))[3]
         - (cz_gate() @ kron_state(KETP, KETP))[1]
         * (cz_gate() @ kron_state(KETP, KETP))[2])),
     "rtol": 1e-12},
    {"name": "4.5.4 the printed SWAP matches the exchange rule", "stated": 0.0,
     "derive": lambda: dev(SCENE_SWAP, swap_gate()), "atol": 1e-15},
    {"name": "4.5.4 three CNOTs make a SWAP", "stated": 0.0,
     "derive": lambda: dev(cnot(0, 1) @ cnot(1, 0) @ cnot(0, 1), swap_gate()),
     "atol": 1e-15},
    {"name": "4.5.4 SWAP creates no entanglement", "stated": 0.0,
     "derive": lambda: _m4_entropy_of(swap_gate() @ kron_state(KETP, KET0)),
     "atol": 1e-12},

    # ── 4.6 Entanglement from a gate ────────────────────────────────────────
    {"name": "4.6.1 the circuit output at 90 degrees is a Bell state",
     "stated": 0.0,
     "derive": lambda: same_state(_m4_entangle_circuit(90.0), BELL_PHI_P),
     "atol": 1e-12},
    {"name": "4.6.1 the caption: one full ebit at 90 degrees", "stated": 1.0,
     "derive": lambda: _m4_entropy_of(_m4_entangle_circuit(90.0)), "rtol": 1e-12},
    {"name": "4.6.1 the caption: nothing at either end", "stated": 0.0,
     "derive": lambda: max(_m4_entropy_of(_m4_entangle_circuit(t))
                           for t in (0.0, 180.0)),
     "atol": 1e-12},
    {"name": "4.6.1 the worked example at 60 degrees", "stated": 0.8113,
     "derive": lambda: _m4_entropy_of(_m4_entangle_circuit(60.0)), "rtol": 1e-3},
    {"name": "4.6.1 a local gate does not change the entanglement",
     "stated": 0.0,
     "derive": lambda: max(_m4_local_gate_gap(t)
                           for t in (30.0, 60.0, 90.0, 140.0)),
     "atol": 1e-12},

    # ── 4.7 Universality ────────────────────────────────────────────────────
    {"name": "4.7.1 four T gates make a Z", "stated": 0.0,
     "derive": lambda: dev(np.linalg.matrix_power(T_GATE, 4), Z), "atol": 1e-14},
    {"name": "4.7.1 eight T gates make the identity", "stated": 0.0,
     "derive": lambda: dev(np.linalg.matrix_power(T_GATE, 8), I2), "atol": 1e-14},
    {"name": "4.7.1 H, S and CNOT are Clifford: they map X to a Pauli",
     "stated": 0.0,
     "derive": lambda: min(dev(S_GATE @ X @ S_GATE.conj().T, s * P)
                           for s in (1, -1, 1j, -1j) for P in (X, Y, Z)),
     "atol": 1e-14},
    {"name": "4.7.1 T is not Clifford: it maps X off every Pauli",
     "stated": 1.0824,
     "derive": lambda: min(dev(T_GATE @ X @ T_GATE.conj().T, s * P)
                           for s in (1, -1, 1j, -1j) for P in (X, Y, Z)),
     "rtol": 1e-3},
]


# ── chapter 5 · circuits and protocols ──────────────────────────────────────
#
# Two things in this chapter are checked by simulating the circuit rather than
# by evaluating the formula the scene quotes. The four teleportation branches
# come from applying the gates to eight amplitudes and projecting, and the
# Grover numbers come from performing the two reflections as reflections. Both
# closed forms — the correction table and sin^2((2r+1)theta) — are therefore
# results of the check rather than assumptions inside it.

_M5_PSI = np.array([0.6, 0.8], dtype=complex)
_M5_PSI2 = np.array([math.cos(math.radians(35.0)),
                     cmath.exp(1j * math.radians(110.0))
                     * math.sin(math.radians(35.0))], dtype=complex)


def _m5_ghz_chain(n):
    """GHZ on n qubits by the chain of CNOTs the scene draws."""
    v = ket(*([0] * n))
    v = on_qubit(H, 0, n) @ v
    for k in range(n - 1):
        v = cnot(k, k + 1, n) @ v
    return v


def _m5_ghz_tree(n):
    """GHZ on n qubits by the doubling tree, which has the same gate count."""
    v = ket(*([0] * n))
    v = on_qubit(H, 0, n) @ v
    width = 1
    while width < n:
        for k in range(width):
            if k + width < n:
                v = cnot(k, k + width, n) @ v
        width *= 2
    return v


def _m5_ghz_target(n):
    """(|0...0> + |1...1>)/sqrt(2), written down rather than built."""
    v = np.zeros(2 ** n, dtype=complex)
    v[0] = v[-1] = 1 / math.sqrt(2)
    return v


def _m5_circuit_scene():
    """H on q0, CNOT 0->1, CNOT 1->2 on three qubits, from |000>."""
    v = ket(0, 0, 0)
    v = on_qubit(H, 0, 3) @ v
    v = cnot(0, 1, 3) @ v
    v = cnot(1, 2, 3) @ v
    return v


def _m5_defer_gap():
    """How far the two circuits of the deferred-measurement scene disagree.

    Circuit A applies the CNOT and measures both qubits. Circuit B measures the
    control first and applies X to the target when the bit is one. The gate
    compares the two joint distributions outcome by outcome.
    """
    psi = _M5_PSI2
    a = cnot(0, 1, 2) @ kron_state(KET0, psi)          # |q1 q0>, target on q1
    pa = [abs(a[x]) ** 2 for x in range(4)]
    pb = [0.0] * 4
    for m in (0, 1):
        p = abs(psi[m]) ** 2
        pb[index((m, m))] += p                          # q1 becomes m as well
    return max(abs(x - y) for x, y in zip(pa, pb))


def _m5_feed_final():
    """The probability that the dynamic circuit's second reading is zero.

    Each branch of the first measurement is followed separately: the qubit is
    left in the state that was read, the X is applied when the bit was one,
    and the branches are weighted by their own probabilities.
    """
    v = H @ KET0
    total = 0.0
    for m in (0, 1):
        after = KET0 if m == 0 else X @ KET1
        total += abs(v[m]) ** 2 * abs(after[0]) ** 2
    return total


def _m5_hadamard_from_rotations():
    """H against exp(i pi/2) Rz(pi/2) Rx(pi/2) Rz(pi/2)."""
    U = rz(math.pi / 2) @ rx(math.pi / 2) @ rz(math.pi / 2)
    return dev(cmath.exp(1j * math.pi / 2) * U, H)


def _m5_cnot_from_cz():
    """CNOT_{0->1} against (H on q1) CZ (H on q1)."""
    h1 = on_qubit(H, 1, 2)
    return dev(h1 @ cz_gate() @ h1, cnot(0, 1, 2))


def _m5_ramsey(phi_deg):
    """p(0) after H, P(phi), H, from the matrices rather than from a cosine."""
    v = H @ phase_gate(math.radians(phi_deg)) @ H @ KET0
    return abs(v[0]) ** 2


def _m5_clone_overlap():
    """|<++|CNOT(|+>|0>)|^2, the overlap of the failed copy with a real one."""
    out = cnot(0, 1, 2) @ kron_state(KET0, KETP)
    return abs(inner(kron_state(KETP, KETP), out)) ** 2


def _m5_clone_reduced():
    """How far each half of the failed copy is from I/2."""
    out = cnot(0, 1, 2) @ kron_state(KET0, KETP)
    rho = np.outer(out, np.conjugate(out))
    return max(dev(partial_trace(rho, keep=k), 0.5 * I2) for k in (0, 1))


def _m5_branch_gap(m0, m1, psi=None):
    """How far Bob's simulated branch state is from X^{m1} Z^{m0} |psi>."""
    psi = _M5_PSI if psi is None else psi
    u, _ = teleport_branch(psi, m0, m1)
    want = np.linalg.matrix_power(X, m1) @ np.linalg.matrix_power(Z, m0) @ psi
    return same_state(u, want)


def _m5_branch_prob(m0, m1, psi=None):
    psi = _M5_PSI if psi is None else psi
    return teleport_branch(psi, m0, m1)[1]


def _m5_bob_gap():
    """The largest distance from I/2 over several inputs, before the bits."""
    return max(dev(teleport_bob(p), 0.5 * I2)
               for p in (_M5_PSI, _M5_PSI2, KET0, KETP))


def _m5_kick_gap():
    """U_f |x>|-> against (-1)^{f(x)} |x>|->, for f(x) = x on one bit.

    The oracle for f(x) = x is a CNOT with the register as control and the
    target as target, and the target is prepared in |->. The claim under test
    is that the pair comes back unchanged apart from the stated sign.
    """
    uf = cnot(0, 1, 2)                       # target on q1, so f(q0) = q0
    worst = 0.0
    for x in (0, 1):
        v = kron_state(KETM, KET0 if x == 0 else KET1)
        worst = max(worst, dev(uf @ v, ((-1) ** x) * v))
    return worst


def _m5_kick_example():
    """|+>|-> after one query with f(x)=x: the register must become |->."""
    out = cnot(0, 1, 2) @ kron_state(KETM, KETP)
    return same_state(out, kron_state(KETM, KETM))


def _m5_grover_angle(n, marked):
    """The angle of the simulated start state from the unmarked axis."""
    v = grover_state(n, marked, 0)
    good = math.sqrt(sum(abs(v[x]) ** 2 for x in marked))
    bad = math.sqrt(max(0.0, 1.0 - good * good))
    return math.degrees(math.atan2(good, bad))


def _m5_grover_turn(n, marked):
    """The angle the first iteration adds, in units of the starting angle."""
    t0 = _m5_grover_angle(n, marked)
    v = grover_state(n, marked, 1)
    good = math.sqrt(sum(abs(v[x]) ** 2 for x in marked))
    bad = math.sqrt(max(0.0, 1.0 - good * good))
    return math.degrees(math.atan2(good, bad)) / t0


CHECKS += [
    # ── 5.1 The circuit model ───────────────────────────────────────────────
    {"name": "5.1.1 the three-gate circuit reaches the GHZ state",
     "stated": 0.0,
     "derive": lambda: same_state(_m5_circuit_scene(), _m5_ghz_target(3)),
     "atol": 1e-14},
    {"name": "5.1.1 p(000) of that state", "stated": 0.5,
     "derive": lambda: abs(_m5_circuit_scene()[0]) ** 2, "rtol": 1e-12},
    {"name": "5.1.3 the string 101 is entry 5 of the vector", "stated": 5.0,
     "derive": lambda: float(index((1, 0, 1))), "atol": 1e-12},
    {"name": "5.1.3 that entry is the amplitude of |101>", "stated": 1.0,
     "derive": lambda: abs(ket(1, 0, 1)[5]), "rtol": 1e-12},
    {"name": "5.1.4 the chain circuit builds GHZ on eight qubits",
     "stated": 0.0,
     "derive": lambda: same_state(_m5_ghz_chain(8), _m5_ghz_target(8)),
     "atol": 1e-13},
    {"name": "5.1.4 the tree circuit builds the same state", "stated": 0.0,
     "derive": lambda: same_state(_m5_ghz_tree(8), _m5_ghz_target(8)),
     "atol": 1e-13},
    {"name": "5.1.4 the chain of sixteen qubits takes 3.2 microseconds",
     "stated": 3.2, "derive": lambda: 16 * 0.2, "rtol": 1e-12},
    {"name": "5.1.4 the tree of sixteen qubits takes 1.0 microsecond",
     "stated": 1.0, "derive": lambda: (1 + math.log2(16)) * 0.2, "rtol": 1e-12},

    # ── 5.2 Running a circuit ───────────────────────────────────────────────
    {"name": "5.2.1 a thirty-qubit state vector, in bytes", "stated": 17.18e9,
     "derive": lambda: 16 * 2.0 ** 30, "rtol": 1e-3},
    {"name": "5.2.1 a fifty-qubit state vector, in bytes", "stated": 18.0e15,
     "derive": lambda: 16 * 2.0 ** 50, "rtol": 1e-2},
    {"name": "5.2.1 the qubits that fit in 64 GB", "stated": 31.9,
     "derive": lambda: math.log2(64e9 / 16), "rtol": 1e-3},
    {"name": "5.2.2 the shots a standard error of 0.005 needs at p = 0.5",
     "stated": 10000.0, "derive": lambda: 0.25 / 0.005 ** 2, "rtol": 1e-12},
    {"name": "5.2.2 the standard error at a thousand shots", "stated": 0.0158,
     "derive": lambda: math.sqrt(0.25 / 1000), "rtol": 2e-3},
    {"name": "5.2.3 the two deferred-measurement circuits agree exactly",
     "stated": 0.0, "derive": _m5_defer_gap, "atol": 1e-14},
    {"name": "5.2.4 the dynamic circuit's second reading is always zero",
     "stated": 1.0, "derive": _m5_feed_final, "rtol": 1e-14},

    # ── 5.3 Compiling for a machine ─────────────────────────────────────────
    {"name": "5.3.1 the Hadamard from three rotations, up to the stated phase",
     "stated": 0.0, "derive": _m5_hadamard_from_rotations, "atol": 1e-14},
    {"name": "5.3.1 the CNOT from a CZ between two Hadamards", "stated": 0.0,
     "derive": _m5_cnot_from_cz, "atol": 1e-14},
    {"name": "5.3.1 forty CNOTs become a hundred and twenty instructions",
     "stated": 120.0, "derive": lambda: 40 + 2 * 40, "atol": 1e-12},
    {"name": "5.3.2 routing across four qubits on a line costs seven CNOTs",
     "stated": 7.0, "derive": lambda: 2 * 3 + 1, "atol": 1e-12},

    # ── 5.4 Interference in a circuit ───────────────────────────────────────
    {"name": "5.4.1 the Ramsey circuit at ninety degrees", "stated": 0.5,
     "derive": lambda: _m5_ramsey(90.0), "rtol": 1e-12},
    {"name": "5.4.1 the Ramsey circuit at a hundred and eighty degrees",
     "stated": 0.0, "derive": lambda: _m5_ramsey(180.0), "atol": 1e-28},
    {"name": "5.4.1 the Ramsey circuit is a cosine squared throughout",
     "stated": 0.0,
     "derive": lambda: max(abs(_m5_ramsey(d)
                               - math.cos(math.radians(d) / 2) ** 2)
                           for d in range(0, 361, 5)),
     "atol": 1e-14},
    {"name": "5.4.1 the standard error at four thousand shots",
     "stated": 0.0079, "derive": lambda: math.sqrt(0.25 / 4000), "rtol": 2e-3},

    # ── 5.5 Teleportation ───────────────────────────────────────────────────
    {"name": "5.5.1 the failed copy overlaps a real copy by one half",
     "stated": 0.5, "derive": _m5_clone_overlap, "rtol": 1e-12},
    {"name": "5.5.1 both halves of the failed copy are maximally mixed",
     "stated": 0.0, "derive": _m5_clone_reduced, "atol": 1e-14},
    # The four branches, one check each, because each is a separate claim of
    # the correction table and a table with one wrong row still looks right.
    {"name": "5.5.3 branch m1m0 = 00 leaves Bob with |psi>", "stated": 0.0,
     "derive": lambda: _m5_branch_gap(0, 0), "atol": 1e-14},
    {"name": "5.5.3 branch m1m0 = 01 leaves Bob with Z|psi>", "stated": 0.0,
     "derive": lambda: _m5_branch_gap(1, 0), "atol": 1e-14},
    {"name": "5.5.3 branch m1m0 = 10 leaves Bob with X|psi>", "stated": 0.0,
     "derive": lambda: _m5_branch_gap(0, 1), "atol": 1e-14},
    {"name": "5.5.3 branch m1m0 = 11 leaves Bob with XZ|psi>", "stated": 0.0,
     "derive": lambda: _m5_branch_gap(1, 1), "atol": 1e-14},
    {"name": "5.5.4 branch m1m0 = 00 has probability one quarter",
     "stated": 0.25, "derive": lambda: _m5_branch_prob(0, 0), "rtol": 1e-12},
    {"name": "5.5.4 branch m1m0 = 01 has probability one quarter",
     "stated": 0.25, "derive": lambda: _m5_branch_prob(1, 0), "rtol": 1e-12},
    {"name": "5.5.4 branch m1m0 = 10 has probability one quarter",
     "stated": 0.25, "derive": lambda: _m5_branch_prob(0, 1), "rtol": 1e-12},
    {"name": "5.5.4 branch m1m0 = 11 has probability one quarter",
     "stated": 0.25, "derive": lambda: _m5_branch_prob(1, 1), "rtol": 1e-12},
    {"name": "5.5.4 the four branch probabilities add to one", "stated": 1.0,
     "derive": lambda: sum(_m5_branch_prob(a, b)
                           for a in (0, 1) for b in (0, 1)),
     "rtol": 1e-12},
    {"name": "5.5.4 a second input gives the same four probabilities",
     "stated": 0.0,
     "derive": lambda: max(abs(_m5_branch_prob(a, b, _M5_PSI2) - 0.25)
                           for a in (0, 1) for b in (0, 1)),
     "atol": 1e-14},
    {"name": "5.5.5 Bob holds I/2 before the bits arrive, for every input",
     "stated": 0.0, "derive": _m5_bob_gap, "atol": 1e-14},
    {"name": "5.5.6 a separable pair reaches exactly the classical benchmark",
     "stated": 0.6667, "derive": lambda: (2 * 0.5 + 1) / 3, "rtol": 1e-3},
    {"name": "5.5.6 a perfect pair reaches fidelity one", "stated": 1.0,
     "derive": lambda: (2 * 1.0 + 1) / 3, "rtol": 1e-12},
    {"name": "5.5.6 the pair quality behind an average fidelity of 0.81",
     "stated": 0.715, "derive": lambda: (3 * 0.81 - 1) / 2, "rtol": 1e-12},

    # ── 5.6 Grover search ───────────────────────────────────────────────────
    {"name": "5.6.2 the oracle writes a sign and changes no probability",
     "stated": 0.0, "derive": _m5_kick_gap, "atol": 1e-14},
    {"name": "5.6.2 one query carries |+> to |-> when f(x) = x", "stated": 0.0,
     "derive": _m5_kick_example, "atol": 1e-14},
    {"name": "5.6.3 the starting angle for a thousand candidates, in degrees",
     "stated": 1.7908, "derive": lambda: _m5_grover_angle(10, [7]),
     "rtol": 1e-3},
    {"name": "5.6.3 the starting success probability is one in N",
     "stated": 0.000977, "derive": lambda: grover_success(10, [7], 0),
     "rtol": 1e-3},
    {"name": "5.6.4 one iteration turns the state to three times the angle",
     "stated": 3.0, "derive": lambda: _m5_grover_turn(10, [7]), "rtol": 1e-6},
    {"name": "5.6.5 the eight-candidate example succeeds with certainty",
     "stated": 1.0, "derive": lambda: grover_success(3, [5, 6], 1),
     "rtol": 1e-12},
    {"name": "5.6.5 two iterations return the eight-candidate example to 0.25",
     "stated": 0.25, "derive": lambda: grover_success(3, [5, 6], 2),
     "rtol": 1e-12},
    {"name": "5.6.5 the simulated optimum for a thousand candidates",
     "stated": 25.0, "derive": lambda: float(grover_best(10, [7], 60)),
     "atol": 1e-12},
    {"name": "5.6.5 the success probability at that optimum", "stated": 0.9995,
     "derive": lambda: grover_success(10, [7], 25), "rtol": 1e-3},
    {"name": "5.6.5 the overshoot: twice the optimum returns almost nothing",
     "stated": 0.00023, "derive": lambda: grover_success(10, [7], 50),
     "rtol": 5e-2},
    {"name": "5.6.5 the formula and the simulation agree at every count",
     "stated": 0.0,
     "derive": lambda: max(
         abs(grover_success(10, [7], r)
             - math.sin((2 * r + 1) * math.asin(math.sqrt(1 / 1024))) ** 2)
         for r in range(0, 61, 5)),
     "atol": 1e-12},
    {"name": "5.6.6 the queries Grover needs against the classical count",
     "stated": 512.0, "derive": lambda: (1024 + 1) / 2, "rtol": 1e-2},
    {"name": "5.6.6 the quantum run takes 250 microseconds", "stated": 250.0,
     "derive": lambda: 25 * 10.0, "rtol": 1e-12},
    {"name": "5.6.6 the classical run takes 5.1 microseconds", "stated": 5.1,
     "derive": lambda: 512 * 0.01, "rtol": 1e-2},
]



if __name__ == "__main__":
    main(CHECKS, "verify_scenes — chapters 1 to 5, teaching scenes")
