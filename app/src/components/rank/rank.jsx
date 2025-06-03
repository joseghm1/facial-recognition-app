import React from "react";


const rank = ({name, entries}) => {
console.log(name)
console.log(entries)
    return(
        <div>
            <div className="white f3">
                {`${name}, your current rank is...`}
            </div>
            <div className= "white f1">
                {entries}
            </div>
        </div>
    );
}

export default rank;