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

bbbmpe = {
    name: "BBBMPE",
    // Ported from solitare's endec in https://tbgforums.com/forums/viewtopic.php?pid=597591#p597591
    encode: function(input){
        var toast = "";
        var pa = true;
        for (var ore of [...input]) {
            var bar = ore.codePointAt().toString(16);
            if (bar.length < 5){
                if (toast == "" || !pa) toast += String.fromCodePoint(parseInt(bar, 16));
                else toast += `ӏ${String.fromCodePoint(parseInt(bar))}`;
                pa = false;
            } else if (bar.length > 5) {
                pa = true;
                let spam = String.fromCodePoint(parseInt(bar.slice(2,4), 16) + 10240);
                let ham = String.fromCodePoint(parseInt(bar.slice(4,6), 16) + 10240);
                let arrow = String.fromCodePoint(parseInt(bar.slice(0,2) ,16) + 8592);
                toast += `ӏ${arrow}${spam}${ham}`;
            } else {
                pa = true;
                let spam = String.fromCodePoint(parseInt(bar.slice(1,3), 16) + 10240);
                let ham = String.fromCodePoint(parseInt(bar.slice(3,5), 16) + 10240);
                let arrow = String.fromCodePoint(parseInt(bar[0], 16) + 8592);
                toast += `ӏ${arrow}${spam}${ham}`;
            }
        }
        return toast;
    },
    decode: function(input){
        var foo = input.split("ӏ");
        var toast = "";
        for (var bring of foo){
            if (bring.length > 3 || bring.length < 3) toast += bring;
            else if (bring.includes("↠")) {
                let eggs = bring[1].codePointAt().toString(16).slice(2,4);
                let baz = bring[2].codePointAt().toString(16).slice(2,4);
                toast += String.fromCodePoint(parseInt(`10${eggs}${baz}`, 16))
            }
            else {
                let home = (bring[0].codePointAt() - 8592).toString(16);
                let eggs = bring[1].codePointAt().toString(16).slice(2,4)
                let baz = bring[2].codePointAt().toString(16).slice(2,4)
                toast += String.fromCodePoint(parseInt(`${home}${eggs}${baz}`, 16))
            }
        }
        return toast;
    }
}

smiley = {
    name: "Smiley Plane",
    encode: function (input) {
        var smiley = [":) ", ":| ", ":( ", ":o ", ":D ", ":lol: ", ":/ ", "D:< ", ";) ", ":P ", ":roll: ", "B) "];
        var replace = "0123456789ab";

        // replace [smiley] with \[smiley]
        var pattern = /\[((?::\)|:\||:\(|:o|:D|:lol:|:\/|D:<|;\)|:P|:roll:|B\)| )+)\]/g;
        var result = input.replace(pattern, "\\[$1]");

        function toSmiley(m, str) {
	        var result = "";
	        for (var x = 0; x < str.length; x += 2){
		        var high = str.charCodeAt(x) - 0xD800;
		        var low = str.charCodeAt(x + 1) - 0xDC00;
         		var combined = 0x10000 + high * 0x400 + low;
		        var chr = ("000000"+combined.toString(12,9)).slice(-6);
		        for (var c of chr) result += smiley[replace.indexOf(c)];
	        }
	        return "[ " + result + "]";
        }

        // replace non-BMP characters
        pattern = /((?:[\uD800-\uDBFF][\uDC00-\uDFFF])+)/g;
        result = result.replace(pattern,toSmiley);
        return result;
    },
    decode: function(input) {
        smiley = [/:\) /g, /:\| /g, /:\( /g, /:o /g, /:D /g, /:lol: /g, /:\/ /g, /D:< /g, /;\) /g, /:P /g, /:roll: /g, /B\) /g];
        replace = "0123456789ab";

        function fromSmiley(m, str) {
	        let result = "";
	        let doz = str;
	        for (var i in smiley) doz = doz.replace(smiley[i], replace[i]);
	        for (var x = 0; x < doz.length; x += 6) result += String.fromCodePoint(parseInt(doz.slice(x, x + 6), 12));
	        return result;
        }

        // replace [smiley] with non-BMP characters
        pattern = /(?<!\\)\[ ((?::\)|:\||:\(|:o|:D|:lol:|:\/|D:<|;\)|:P|:roll:|B\)| )+)\]/g;
        result = input.replace(pattern,fromSmiley);

        // replace \[smiley] with [smiley]
        var pattern = /\\\[((?::\)|:\||:\(|:o|:D|:lol:|:\/|D:<|;\)|:P|:roll:|B\)| )+)\]/g;
        var result = result.replace(pattern, "[$1]");
        return result;
    }
}
