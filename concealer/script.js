let link = document.getElementById("link");
let unencode = document.getElementById("unencode");
let encrypt = document.getElementById("encrypt");
let password = document.getElementById("password");
let generated = document.getElementById("generated");
let head = "https://gilbert189.github.io/concealer/redirect.html#";
let form = document.getElementById("form");

let enc = new TextEncoder();
let dec = new TextDecoder();
const SALT = "wxwSGInE2SwNJK4Ooj2YnIKdB2z5JhJwdSB7YbEkhgmIUCok8KkkpIY0GFAq2z5BsSTg3hIHwVVhQzNEOULTy3w=";
let KEY_SIZE = 16;
const KEY_SIZES = [16, 24, 32];

function generate(event) {
    // don't refresh
    event.preventDefault();

    // if unencode is checked, just append the raw link
    let result = "";
    if (unencode.checked) {
        result = head + encodeURIComponent(link.value);
    } else {
        // if encrypt is checked, encrypt the link first
        let mode = 0x00;
        result = link.value;
        if (encrypt.checked) {
            let buffer = forge.util.createBuffer(enc.encode(result), 'raw');
            let iv = ">4jVia^xSs5a7ky<`1X~2^4xd^G4gLx%nuY82GFS";

            // check if user wants to encrypt by password
            mode = 0x40 | KEY_SIZE;
            if (password.value != "") {
                mode |= 0x80;
                var key = forge.pkcs5.pbkdf2(password.value, SALT, 16, KEY_SIZE);
            } else {
                var key = forge.random.getBytesSync(KEY_SIZE);
            }

            // the cipher
            let cipher = forge.cipher.createCipher('AES-CBC', key);
            cipher.start({iv: iv});
            cipher.update(buffer);
            cipher.finish();
            let encrypted = cipher.output;
            result = encrypted.bytes();

            console.log({key, code:result});
            // append the key to the link if desired
            if (password.value == "") result = key + result;
        } else {
            result = result;
        }
        // the expected result should be an iterator
        result = btoa(result + String.fromCodePoint(mode));
        result = head + result;
    }
    generated.innerText = result;
}

form.addEventListener("submit", generate);