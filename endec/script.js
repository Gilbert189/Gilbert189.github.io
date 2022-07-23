// The main code.

var endecs = {"nkoder": nkoder, "gilbert": gilbert, "grogar2": grogar2, "5-15": five15, "bbbmpe": bbbmpe, "smiley": smiley};

plain = document.getElementById("plain");
coded = document.getElementById("coded");
var select = document.getElementById("endec-select");
for (var i in endecs){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = endecs[i].name;
    select.appendChild(opt);
}
var selected = select[select.selectedIndex].value;

select.onchange = function(){
    selected = this[this.selectedIndex].value;
    console.log(selected);
};

function encode(){
    coded.value = endecs[selected].encode(plain.value);
} 

function decode(){
    plain.value = endecs[selected].decode(coded.value);
} 

const search = new URLSearchParams(window.location.search);
const params = Object.fromEntries(search.entries());
if (params.plain) plain.value = params.plain;
if (params.coded) coded.value = params.coded;
if (params.select) {
    select.selectedIndex = parseInt(params.select, 10);
    selected = select[select.selectedIndex].value;
}

function link(){
    search.set("plain", plain.value);
    search.set("coded", coded.value);
    search.set("select", select.selectedIndex);
    window.history.replaceState({}, '', `${location.pathname}?${search.toString()}`);
}
