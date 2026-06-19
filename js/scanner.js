
// ========================
// SHADOW HUB SCANNER
// ========================

async function getJSON(url){

    try{

        const r=await fetch(url);

        if(!r.ok)
            return null;

        return await r.json();

    }

    catch(e){

        console.log(url,e);

        return null;

    }

}



// ========================
// TITLE
// ========================

function getTitle(param){

    if(!param)
        return "Unknown";


    const loc=param.localizedParameters;


    if(!loc)
        return param.titleId;



    return (

        loc["es-419"]?.titleName

        ||

        loc["es-ES"]?.titleName

        ||

        loc["en-US"]?.titleName

        ||

        loc["en-GB"]?.titleName

        ||

        loc["ja-JP"]?.titleName

        ||

        param.titleId

    );


}



// ========================
// TYPE
// ========================

function getType(id){


    if(

        id.startsWith("PPSA")

        ||

        id.startsWith("PPSX")

    )

        return "PS5";



    return "PS4";


}



// ========================
// INSTALLED
// ========================

async function scanInstalled(){


    console.log(

        "Scanning installed..."

    );



    const games=[];



    const list=

    await getJSON(

        "/fs/user/app/?fmt=json"

    );



    if(!list)

        return games;



    const hidden=[

        ".",

        "ITEM00001",

        "FAKE00000",

        "NPXS40165",

        "NPXS40172"

    ];



    for(

        const app

        of

        list

    ){


        const id=

        app.name;



        if(

            hidden.includes(id)

        )

        continue;



        const param=

        await getJSON(

            "/fs/user/appmeta/"

            +

            id

            +

            "/param.json"

        );



        if(

            !param

        )

        continue;



        games.push({


            title:

            getTitle(

                param

            ),



            titleId:

            id,



            icon:

            "/fs/user/appmeta/"

            +

            id

            +

            "/icon0.png",



            bg:

            "/fs/user/appmeta/"

            +

            id

            +

            "/pic0.png",



            audio:

            "/fs/user/appmeta/"

            +

            id

            +

            "/snd0.at9",



            mounted:

            false,



            favorite:

            false,



            folder:

            "",



            type:

            getType(

                id

            )


        });



    }



    console.log(

        games.length,

        "installed"

    );



    return games;


}



// ========================
// SHADOW
// ========================

async function scanShadow(){



    console.log(

        "Scanning ShadowMount..."

    );



    const games=[];



    const folders=

    await getJSON(

        "/fs/mnt/shadowmnt/?fmt=json"

    );



    if(

        !folders

    )

    return games;



    for(

        const f

        of

        folders

    ){



        if(

            f.name==="."

        )

        continue;



        const encoded=

        encodeURIComponent(

            f.name

        );



        const base=

        "/fs/mnt/shadowmnt/"

        +

        encoded

        +

        "/sce_sys/";



        const param=

        await getJSON(

            base+

            "param.json"

        );



        if(

            !param

        )

        continue;



        games.push({



            title:

            getTitle(

                param

            ),



            titleId:

            param.titleId,



            icon:

            base+

            "icon0.png",



            bg:

            base+

            "pic0.png",



            audio:

            base+

            "snd0.at9",



            mounted:

            true,



            favorite:

            false,



            folder:

            f.name,



            type:

            getType(

                param.titleId

            )


        });



    }



    console.log(

        games.length,

        "shadow"

    );



    return games;


}



// ========================
// MERGE
// ========================

function mergeGames(

    installed,

    shadow

){



    const map={};



    for(

        const g

        of

        installed

    ){


        map[

            g.titleId

        ]=g;


    }



    for(

        const s

        of

        shadow

    ){



        if(

            map[

                s.titleId

            ]

        ){


            map[

                s.titleId

            ]

            .mounted=true;



            map[

                s.titleId

            ]

            .folder=s.folder;



        }


        else{


            map[

                s.titleId

            ]

            =s;


        }



    }



    return Object

    .values(

        map

    )



    .sort(

        (a,b)=>

        a.title

        .localeCompare(

            b.title

        )

    );


}



// ========================
// ALL
// ========================

async function scanAll(){



    const installed=

    await scanInstalled();



    const shadow=

    await scanShadow();



    const games=

    mergeGames(

        installed,

        shadow

    );



    console.log(

        games

    );



    return games;


}
