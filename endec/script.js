// The main code.

var endecs = {"nkoder": nkoder, "gilbert": gilbert, "grogar2": grogar2, "5-15": five15};
var selected = "nkoder";

plain = document.getElementById("plain");
coded = document.getElementById("coded");
var select = document.getElementById("endec-select");
for (var i in endecs){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = endecs[i].name;
    select.appendChild(opt);
}
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
