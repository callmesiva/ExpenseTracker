
exports.signLogin = (req,res)=>{
    res.render("signLogin");
}

exports.signLoginSave = (req,res)=>{
    const{name,email,password} = req.body;
    console.log(name,email,password);
    res.send("okay");
}