// List of endecs.
nkoder={
    name: "N'Koder (New 5-15)",
    // Copied from https://pkmnq.github.io/BMP/
    encode: function(input){
        function seq(ord) {
            off = ord - 0x10000;
            high = Math.floor(off / 0x8000)
            low = off % 0x8000
            return String.fromCodePoint(high+0x7c0) + String.fromCodePoint(low+0x8000)
        }

        result = "";

        for (chr of [...input]) {
            ord = chr.codePointAt();
            if (ord > 0xffff) {
                result += seq(ord);
            } else if (0x7c0 <= ord && ord <= 0x7df || chr === String.fromCodePoint(0x378)) {
                result += String.fromCodePoint(0x378) + chr;
            } else {
                result += chr;
            }
        }
        return result
    },
    decode: function(input){
        function unseq(pair) {
            high = pair.codePointAt(0) - 0x7c0
            low = pair.codePointAt(1) - 0x8000
            off = (high << 15) + low
            return String.fromCodePoint(off + 0x10000)
        }
        result = "";

        prev = "";
        mode = 0;
        for (chr of [...input]) {
            switch (mode) {
                case 1:
                    result += chr;
                    mode = 0;
                    break;
                case 2:
                    result += unseq(prev + chr);
                    mode = 0;
                    break;
                default:
                    if (chr === String.fromCodePoint(0x378)) {
                        mode = 1;
                    } else if (0x7c0 <= chr.codePointAt() && chr.codePointAt() <= 0x7df) {
                        mode = 2;
                        prev = chr;
                    } else {
                        result += chr;
                    }
                    break;
            }
        }
        return result
    }
}

gilbert={
    name: "Gilbert",
    // Copied straight from a previous project of mine.
    encode: function(input){
        res = "";
        len = input.length;
        console.log(len);
        hs = 0;
        for (var i = 0; i < len; i++){
            console.log(i, input.charCodeAt(i));
            x = input.charCodeAt(i);
            
            // Detect surrogates
            if (x >= 0xDC00 && x <= 0xDFFF) x = 0x10000 + hs * 0x400 + (x - 0xDC00); // Low surrogate
            if (x >= 0xD800 && x <= 0xDBFF) hs = x - 0xD800; // High surrogate
            else {
                //console.log(x, String.fromCodePoint(x));
                if (x > 0x10000 || (x > 0xE000 && x < 0xF8FF)) res += String.fromCodePoint((0xE000 + (x % (1 << 12)))) +
                                                                      String.fromCodePoint((0xF000 + (x >> 12)));
                else res += String.fromCodePoint(x);
            }
        }
        return res;
    },
    decode: function(input){
        var res = "";
        var i = 0;
        while (i < input.length) {
            var x = input.charCodeAt(i);
            if (x > 0xE000 && x < 0xF8FF) {
                var y = 0;
                for (var z of input.slice(i,i+2)){
                    z = z.charCodeAt(0);
                    if (z > 0xE000 && z < 0xEFFF) y |= (z % (1 << 12));
                    else if (z > 0xF000 && z < 0xF8FF) y |= (z % (1 << 12)) << 12;
                }
                i += 1;
                x = y;
            }
            res += String.fromCodePoint(x);
            i += 1;
        }
        return res;
    }
}

grogar2={
    name: "Grogar (version 2.1)",
    // Ported from these endecs: https://tbgforums.com/forums/viewtopic.php?pid=574987#p574987
    encode: function(input){
        var res = "";
        var pre = 0;

        for (var c of [...input]){ // thanks for the tip pkmnq
            if ((c.codePointAt() >= 0xE000 && c.codePointAt() < 0xF900) || c.codePointAt() >= 0x10000) {
                hi = c.codePointAt() >> 12;
                lo = c.codePointAt() % 0x1000;
                if (hi != pre) res += String.fromCodePoint(hi + 0xF000);
                res += String.fromCodePoint(lo + 0xE000);
                pre = hi;
            }
            else res += c;
        }
        return res;
    },
    decode: function(input){
        var res = "";
        var hi = 0;
        var lo = 0;

        for (var c of [...input]) {
            if (c.codePointAt() >= 0xF000 && c.codePointAt() < 0xF900) hi = c.codePointAt() - 0xF000;
            else if (c.codePointAt() >= 0xE000 && c.codePointAt() < 0xF000) {
                lo = c.codePointAt() - 0xE000;
                res += String.fromCodePoint(hi * 0x1000 + lo);
            }
            else res += c;
        }
        return res;
    }
}

five15 = {
    name: "5-15",
    // Ported from the endecs in PkmnQ's siggy.
    encode: function(input){
        let stch = String.fromCodePoint(0x378);
        let ench = String.fromCodePoint(0x379);
        var out = "";
        var mode = 0;

        function seq(char){
            off = char.codePointAt() - 0x10000;
            high = char.codePointAt() >> 16;
            low = char.codePointAt() % 0x8000;
            return String.fromCodePoint(high+0x20) + String.fromCodePoint(low+0x8000);
        }

        for (var char of [...input]){
            if (mode == 0){
                if (char.codePointAt() > 0xffff) {
                    mode = 1;
                    out += stch + seq(char);
                }
                else if (char == stch) out += stch + ench;
                else out += char;
            } else if (mode == 1) {
                if (char.codePointAt() < 0x10000) {
                    mode = 0;
                    out += ench + char;
                }
                else out += seq(char);
            }
        }
        if (mode == 1) out += ench;
        return out;
    },
    decode: function(input){
        let stch = String.fromCodePoint(0x378);
        let ench = String.fromCodePoint(0x379);
        var out = "";
        var mode = 0;

        function unseq(pair){
            high = pair[0] - 0x20;
            low = pair[1] - 0x8000;
            off = (high * 0x8000) + low;
            return String.fromCodePoint(off + 0x10000);
        }

        var pair = [];
        var prev = 0;
        for (var char of [...input]){
            if (mode == 0) {
                if (char == stch) {
                    mode = 1;
                    prev = 1;
                }
                else out += char;
            } else if (mode == 1){
                if (char == ench) {
                    mode = 0;
                    if (prev) out += stch;
                }
                else pair.push(char.codePointAt());
                prev = 0;
                if (pair.length == 2) {
                    out += unseq(pair);
                    pair = [];
                }
            }
        }
        return out;
    }
}
