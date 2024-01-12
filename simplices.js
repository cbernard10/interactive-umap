const _BI = typeof BigInt == 'function' ? BigInt : Number;
const _crop = (n) => n <= Number.MAX_SAFE_INTEGER ? Number(n) : _BI(n);

class _CBase {
    /**
     * does `new`
     * @param args
     */
    static of(...args) {
        return new (Function.prototype.bind.apply(this, [null].concat(args)));
    }
    /**
     * Same as `of` but takes a single array `arg`
     *
     * cf. https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
     */
    static from(arg) {
        return new (Function.prototype.bind.apply(this, [null].concat(arg)));
    }
    /**
     * Common iterator
     */
    [Symbol.iterator]() {
        return function* (it, len) {
            for (let i = 0; i < len; i++)
                yield it.nth(i);
        }(this, this.length);
    }
    /**
     * returns `[...this]`.
     */
    toArray() {
        return [...this];
    }
    /**
     * tells wether you need `BigInt` to access all elements.
     */
    get isBig() {
        return Number.MAX_SAFE_INTEGER < this.length;
    }
    /**
     * tells wether it is safe to work on this instance.
     *
     * * always `true` unless your platform does not support `BigInt`.
     * * if not, `true` iff `.isBig` is `false`.
     */
    get isSafe() {
        return typeof BigInt !== 'undefined' || !this.isBig;
    }
    /**
    * check n for nth
    */
    _check(n) {
        if (n < 0) {
            if (this.length < -n)
                return undefined;
            return _crop(_BI(this.length) + _BI(n));
        }
        if (this.length <= n)
            return undefined;
        return n;
    }
    /**
     * get the `n`th element of the iterator.
     * negative `n` goes backwards
     */
    nth(n) { return []; }
    ;
    /**
     * pick random element
     */
    sample() {
        return this.nth(randomInteger(this.length));
    }
    /**
     * an infinite steam of random elements
     */
    samples() {
        return function* (it) {
            while (true)
                yield it.sample();
        }(this);
    }
}

class CartesianProduct extends _CBase {
    constructor(...args) {
        super();
        this.seed = args.map(v => [...v]);
        this.size = this.seed.length;
        const length = this.seed.reduce((a, v) => a * _BI(v.length), _BI(1));
        this.length = _crop(length);
        Object.freeze(this);
    }
    nth(n) {
        n = this._check(n);
        if (n === undefined)
            return undefined;
        let bn = _BI(n);
        let result = [];
        for (let i = 0; i < this.size; i++) {
            const base = this.seed[i].length;
            const bb = _BI(base);
            const bd = bn % bb;
            result.push(this.seed[i][Number(bd)]);
            bn -= bd;
            bn /= bb;
        }
        return result;
    }
}

function permutation(n, k) {
    if (n < 0)
        throw new RangeError(`negative n is not acceptable`);
    if (k < 0)
        throw new RangeError(`negative k is not acceptable`);
    if (0 == k)
        return 1;
    if (n < k)
        return 0;
    [n, k] = [_BI(n), _BI(k)];
    let p = _BI(1);
    while (k--)
        p *= n--;
    return _crop(p);
}

function combination(n, k) {
    if (0 == k)
        return 1;
    if (n == k)
        return 1;
    if (n < k)
        return 0;
    const P = permutation;
    const c = _BI(P(n, k)) / _BI(P(k, k));
    return _crop(c);
}

function combinadic(n, k) {
    const count = combination(n, k);
    return (m) => {
        if (m < 0 || count <= m)
            return undefined;
        let digits = [];
        let [a, b] = [n, k];
        let x = _BI(count) - _BI(1) - _BI(m);
        for (let i = 0; i < k; i++) {
            a--;
            while (x < combination(a, b))
                a--;
            digits.push(n - 1 - a);
            x -= _BI(combination(a, b));
            b--;
        }
        return digits;
    };
}

class Combination extends _CBase {
    constructor(seed, size = 0) {
        super();
        this.seed = [...seed];
        this.size = 0 < size ? size : this.seed.length;
        this.size = size;
        this.length = combination(this.seed.length, this.size);
        this.comb = combinadic(this.seed.length, this.size);
        Object.freeze(this);
    }
    /**
     * returns an iterator which is more efficient
     * than the default iterator that uses .nth
     *
     * @link https://en.wikipedia.org/wiki/Combinatorial_number_system#Applications
     */
    bitwiseIterator() {
        // console.log('overriding _CBase');
        const ctor = this.length.constructor;
        const [zero, one, two] = [ctor(0), ctor(1), ctor(2)];
        const inc = (x) => {
            const u = x & -x;
            const v = u + x;
            return v + (((v ^ x) / u) >> two);
        };
        let x = (one << ctor(this.size)) - one; // 0b11...1
        return function* (it, len) {
            for (let i = 0; i < len; i++, x = inc(x)) {
                let result = [];
                for (let y = x, j = 0; zero < y; y >>= one, j++) {
                    if (y & one)
                        result.push(it.seed[j]);
                }
                // console.log(`x = ${x}`);
                yield result;
            }
        }(this, this.length);
    }
    nth(n) {
        n = this._check(n);
        if (n === undefined)
            return undefined;
        let result = [];
        for (let i of this.comb(n)) {
            result.push(this.seed[i]);
        }
        return result;
    }
}

function Simplex(n, indices = null, data = null){

    this.dim = n
    this.elements = {}
    this.baseString = indices ?? [...Array(n+1).keys()].join('')
    this.data = null

    for(let k = 0; k <= n; k++){
        this.elements[k] = [... new Combination(this.baseString, k+1)]
    }

    this.face = j => {
        newBaseString = [...Array(n).keys()].join('')
        return new Simplex(this.dim - 1, newBaseString)
    }
}

function SimplicialComplex(indices) {

    // indices: array of indices that describe the highest dimentional simplices
    
    this.simplices = simplices 
    this

    // relabel


}

let S = new Simplex(2,'123')
// S.span()
console.log(S)
console.log(S.face(3).face(2))
console.log(S.face(2).face(2)) // didj = d(j-1)di si i<j


let SC = new SimplicialComplex('')