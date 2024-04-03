import img01 from '../../assets/food.png';
import img03 from '../../assets/voipimage.png';
import img04 from '../../assets/image_app.png';
import img05 from '../../assets/portfolio.png';
import img06 from '../../assets/firstCode.png';
import img07 from '../../assets/previssime.png';

import structure_01 from '../../assets/file_structure/file_structure_Chefood.png';
import structure_02 from '../../assets/file_structure/file_structure_voip.png';
import structure_03 from '../../assets/file_structure/file_structure_previssime.png';
import structure_04 from '../../assets/file_structure/file_structure_application.png';
import structure_05 from '../../assets/file_structure/file_structure_Portfolio.png';
import structure_06 from '../../assets/file_structure/file_structure_firstCode.png';


// PROJECT 1
import p1img1 from '../../assets/project1/p1img1.png';
// import p1img2 from '../../assets/project1/p1img2.png';
import p1img3 from '../../assets/project1/p1img3.png';
import p1img4 from '../../assets/project1/p1img4.png';
import p1img5 from '../../assets/project1/p1img5.png';
import p1img6 from '../../assets/project1/p1img6.png';
import p1img7 from '../../assets/project1/p1img7.png';
import p1img8 from '../../assets/project1/p1img8.png';
import p1img9 from '../../assets/project1/p1img9.png';
import p1img10 from '../../assets/project1/p1img10.png';
import p1img11 from '../../assets/project1/p1img11.png';

// PROJECT 2
import p2img1 from '../../assets/project2/p2img1.png';
import p2img2 from '../../assets/project2/p2img2.png';
import p2img3 from '../../assets/project2/p2img3.png';
import p2img4 from '../../assets/project2/p2img4.png';
import p2img5 from '../../assets/project2/p2img5.png';
import p2img6 from '../../assets/project2/p2img6.png';
import p2img7 from '../../assets/project2/p2img7.png';
import p2img8 from '../../assets/project2/p2img8.png';
import p2img9 from '../../assets/project2/p2img9.png';
import p2img10 from '../../assets/project2/p2img10.png';

// PROJECT 3
import p3img1 from '../../assets/project3/p3img1.png';
import p3img2 from '../../assets/project3/p3img2.png';
import p3img3 from '../../assets/project3/p3img3.png';
import p3img4 from '../../assets/project3/p3img4.png';
import p3img5 from '../../assets/project3/p3img5.png';
import p3img6 from '../../assets/project3/p3img6.png';
import p3img7 from '../../assets/project3/p3img7.png';
import p3img8 from '../../assets/project3/p3img8.png';
import p3img9 from '../../assets/project3/p3img9.png';
import p3img10 from '../../assets/project3/p3img10.png';
import p3img11 from '../../assets/project3/p3img11.png';
import p3img12 from '../../assets/project3/p3img12.png';


// PROJECT 4
import p4img1 from '../../assets/project4/p4img1.png';
import p4img2 from '../../assets/project4/p4img2.png';
import p4img3 from '../../assets/project4/p4img3.png';
import p4img4 from '../../assets/project4/p4img4.png';
import p4img5 from '../../assets/project4/p4img5.png';
import p4img6 from '../../assets/project4/p4img6.png';



// PROJECT 5
import p5img1 from '../../assets/project5/p5img1.png';
import p5img2 from '../../assets/project5/p5img2.png';
import p5img3 from '../../assets/project5/p5img3.png';
import p5img4 from '../../assets/project5/p5img4.png';
import p5img5 from '../../assets/project5/p5img5.png';
import p5img6 from '../../assets/project5/p5img6.png';

// PROJECT 6
import p6img1 from '../../assets/project6/p6img1.png';
import p6img2 from '../../assets/project6/p6img2.png';
import p6img3 from '../../assets/project6/p6img3.png';
import p6img4 from '../../assets/project6/p6img4.png';
import p6img5 from '../../assets/project6/p6img5.png';
import p6img6 from '../../assets/project6/p6img6.png';
import p6img7 from '../../assets/project6/p6img7.png';
import p6img8 from '../../assets/project6/p6img8.png';


// icons
import { FaReact,FaLaravel,FaHtml5,FaCss3Alt,FaBootstrap,FaFigma } from "react-icons/fa6";
import { BiLogoJquery } from "react-icons/bi";
import { SiMysql} from "react-icons/si";
import { IoLogoJavascript , IoLogoCapacitor } from "react-icons/io5";

export const ProData = [
    {
        id: 1,
        image_gallery:[
            {p6img:p1img1},
            {p6img:p1img3},
            {p6img:p1img4},
            {p6img:p1img5},
            {p6img:p1img6},
            {p6img:p1img7},
            {p6img:p1img8},
            {p6img:p1img9},
            {p6img:p1img10},
            {p6img:p1img11},
        ],
        project_image: img01,
        project_date: "30/05/2023",
        project_title: 'Chefood Restaurant website',
        project_desc: [<FaFigma /> , <FaCss3Alt />  , <FaBootstrap />,<FaReact/> ,<FaLaravel />  , <SiMysql /> ],
        project_details: '"this website is a responsive Chefood Restaurant site, meticulously designed on Figma and created using React.js, CSS, Bootstrap, RestAPI,and Laravel. "',

        project_categories:[
            {categorie: "web design"},
            {categorie: "web application"},
            {categorie: "front end"},
            {categorie: "back end"},
            {categorie: "redux¦store"},
            
            {categorie: "full stack"},
           
        ],
        project_tags:[
            {tag:"#Restaurant-Website"},
            {tag:"#ReactJs"},
            
            {tag: "#FullStack"},
            {tag: "#Laravel"},
            {tag: "#RestAPI"},
        ],
        project_structure_img: structure_01 ,
        project_link_preview: 'https://github.com/hamzaarabi',
    },
    {
        id: 2,
        image_gallery:[
            {p6img:p2img1},
            {p6img:p2img2},
            {p6img:p2img3},
            {p6img:p2img4},
            {p6img:p2img5},
            {p6img:p2img6},
            {p6img:p2img7},
            {p6img:p2img8},
            {p6img:p2img9},
            {p6img:p2img10},
        ],
        project_image: img03,
        project_date: "20/11/2023",
        project_title: 'Voip website for a company Voipitltds',
        project_desc: [<FaHtml5 />  ,  <FaCss3Alt />  ,<IoLogoJavascript/>  ],
        project_details: '"Responsive voip Website Using HTML CSS & JavaScript , Smooth scrolling in each section , Developed first with the Mobile First methodology then for desktop , Compatible with all mobile devices and with a beautiful and pleasant user interface ."',
        project_categories:[
            {categorie: "web design"},
            {categorie: "front end"},
            {tagcategorie: "FullStack"},
        ],
        project_tags:[
            {tag: "#responsive_voip_website"},
            {tag: "#html"},
            {tag: "#Css"},
            {tag: "#javascript"},
           
        ],
        project_structure_img: structure_02,
        project_link_preview: 'https://voipitltds.com/',
    },
    {
        id: 3,
        image_gallery:[
            {p6img:p3img1},
            {p6img:p3img2},
            {p6img:p3img3},
            {p6img:p3img4},
            {p6img:p3img5},
            {p6img:p3img6},
            {p6img:p3img7},
            {p6img:p3img8},
            {p6img:p3img9},
            {p6img:p3img10},
            {p6img:p3img11},
            {p6img:p3img12},
        ],
        project_image: img07,
        project_date: "20/12/2023",
        project_title: 'Website for insurance agency Swiss using laravel',
        project_desc: [<FaHtml5 />, <FaCss3Alt />, <IoLogoJavascript/>, <FaLaravel/>, <FaBootstrap/>],
        project_details: 'Website for insurance agency Swiss using laravel, CSS, blade ,and JavaScript  .',

        project_categories:[
            {categorie: "web application"},
            {categorie: "back end"},
        ],
        project_tags:[
            {tag: "#Insurance website"},
            {tag: "#Javascript"},
            {tag: "#Laravel"},
        ],
        project_structure_img: structure_03,
        project_link_preview: 'https://github.com/hamzaarabi',
    },
    {
        id: 4,
        image_gallery:[
            {p6img:p4img1},
            {p6img:p4img2},
            {p6img:p4img3},
            {p6img:p4img4},
            {p6img:p4img5},
            {p6img:p4img6},
            
           
        ],
        project_image: img04,
        project_date: "15/01/2024",
        project_title: 'Application mobile with capacitorJs',
        project_desc: [<IoLogoCapacitor />, <FaHtml5 />, <FaCss3Alt />, <IoLogoJavascript/>],
        project_details: '" Application mobile with capacitorJs, for insurance agency Swiss  ."',
       
        project_categories:[
            {categorie: "web design"},
            {categorie: "front end"},
        ],
        project_tags:[
            {tag: "#applicationMobile"},
            {tag: "#html"},
            {tag: "#css"},
            {tag: "#Javascript"},
        ],
        project_structure_img: structure_04,
        project_link_preview: 'https://github.com/hamzaarabi',
    },
    {
        id: 5,
        image_gallery:[
            {p6img:p5img1},
            {p6img:p5img2},
            {p6img:p5img3},
            {p6img:p5img4},
            {p6img:p5img5},
            {p6img:p5img6},
            
        ],
        project_image: img05,
        project_title: 'Portfolio website',
        project_date: "01/01/2024",
        project_desc: [<FaFigma/>,<FaCss3Alt />, <FaBootstrap />,<FaReact />],
        project_details: '"Step into my digital realm with this Portfolio, crafted with the prowess of ReactJS. Embark on a journey through my professional trajectory via a dynamic interface that seamlessly narrates my digital footprint. Leveraging the avant-garde features of ReactJS, this website doesn\'t just exhibit my skills and triumphs; it offers an immersive, responsive user experience. Immerse yourself in a visually captivating design that mirrors my distinctive style and proficiency. From spotlighting standout projects to celebrating personal milestones, this portfolio stands as a testament to my unwavering commitment and expertise in the realm of web development."',
       
        project_categories:[
            {categorie: "Front end"},
            {categorie: "Personnel website"},
            {categorie: "FullStack"},
        ],
        project_tags:[
            {tag: "#my_portfolio"},
            {tag: "#Css"},
            {tag: "#Bootstrap"},
            {tag: "#react js"},
        ],
        project_structure_img: structure_05,
        project_link_preview: 'https://github.com/hamzaarabi',
    },
    {
        id: 6,
        project_image: img06,
        image_gallery:[
            {p6img:p6img1},
            {p6img:p6img2},
            {p6img:p6img3},
            {p6img:p6img4},
            {p6img:p6img5},
            {p6img:p6img6},
            {p6img:p6img7},
            {p6img:p6img8},
            
           
        ],
        project_title: 'My first app web with html , css & js ',
        project_date: "01/11/2021",
        project_desc: [<FaCss3Alt />, <FaHtml5 /> ,<BiLogoJquery />,<IoLogoJavascript/>],
        project_details: '" My first app web with html , css & js . like a website E-commerce online shop Clothing for MEN ,WOMEN and KIDS." ',

        project_categories:[
            {categorie: "web application"},
            {categorie: "front end"},
            
        ],
        project_tags:[
            {tag: "#web_application "},
            {tag: "#Html"},
            {tag: "#Css"},
            {tag: "#js"},
            {tag: "#Frontend"},
        ],
        project_structure_img: structure_06,
        project_link_preview: 'https://github.com/hamzaarabi',
    },
]
