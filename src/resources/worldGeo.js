const S = 1000;
const K = ['name', 'admin', 'iso_a3', 'iso_a3_eh'];
const T = ['Polygon', 'MultiPolygon'];
const D = [
    [
        ['Costa Rica', 'Costa Rica', 'CRI', null],
        0,
        [
            '-1roy,7dq;-ar,-2h;6,-b7;5s,-44;-46,-3b;13,-51;-2b,-5m;-1h,-5j;-f2,66;-5n,5u;37,4t;-11,65;-7p,6o;-ax,5g;-9l,3l;-1t,84;-7b,4z;1t,-83;-5k,-6n;-6c,7q;-8y,2q;-3s,5m;5,8g;3p,8r;-7v,3x;6d,5d;47,3l;ib,-7d;6e,3n;8t,-2c;4m,-5q;87,-1u;6n,5w;72,-f4;aq,-b6;d2,-bv',
        ],
    ],
    [
        ['Nicaragua', 'Nicaragua', 'NIC', null],
        0,
        [
            '-1sjs,8fv;-6n,-5w;-87,1u;-4m,5q;-8t,2c;-6e,-3n;-ib,7d;-47,-3l;-9l,8r;-d0,b8;-64,9d;-bq,8q;-dw,ck;33,4b;4l,-47;23,1z;8n,15;3h,6c;43,9;-l,do;6i,n;5t,-7;60,7f;87,-5m;2u,3g;55,3b;9p,7n;g,5q;2o,-8;3k,6m;2x,u;4q,-49;5l,-19;65,3j;70,0;9n,3n;3v,3s;9j,-k;-2e,-2o;-1f,-67;2u,-a6;-6e,-9h;-30,-b6;-w,-c9;1h,-76;q,-ci;-49,-2q;-2m,-bw;1x,-7c;-5o,-74;1a,-7i;49,-4k',
        ],
    ],
    [
        ['Haiti', 'Haiti', 'HTI', null],
        0,
        [
            '-1jc0,f7m;2f,-f4;-24,-ap;-6s,-4o;75,-8c;-k,-7k;-ig,4q;-d4,-1x;-gz,20;-cz,-57;-ew,8o;2g,8y;pk,-3v;kz,-28;a0,66;-cp,c2;8,am;-hj,4c;69,7o;gy,-18;o4,-4e',
        ],
    ],
    [
        ['Dominican Rep.', 'Dominican Republic', 'DOM', null],
        0,
        [
            '-1jbw,dx9;k,7k;-75,8c;6s,4o;24,ap;-2f,f4;3h,4r;lo,-5;gh,-75;7b,p;52,-9v;f7,k;-w,-8a;cd,-10;dn,-a7;-ab,-bb;-d8,62;-cr,-16;-95,1b;-50,-52;-ao,-1q;-48,6r;-97,-40;-b4,-j0;-76,4f;-1e,7z',
        ],
    ],
    [
        ['El Salvador', 'El Salvador', 'SLV', null],
        0,
        [
            '-1wy1,b4o;86,-2c;60,-5j;8e,-4h;11,-3r;c7,3c;5p,-20;3s,-30;-1x,-b5;-33,-6j;-g3,f;-a0,2o;-bi,5j;-ff,1q;-7w,5y;v,43;9j,70;58,33;-1h,3a;6i,1p',
        ],
    ],
    [
        ['Guatemala', 'Guatemala', 'GTM', null],
        0,
        [
            '-1z5w,b7v;p,83;38,6j;-3y,56;dd,mo;zo,3;p,9g;-4i,1p;-33,60;-aa,6f;-ac,9a;ck,3;0,fn;py,1;pp,-b;-8,-m0;-26,-vd;8a,0;92,-51;2f,45;85,-3j;-co,-am;-d6,-7s;-1y,-5c;27,-5g;-5r,-72;-6i,-1p;1h,-3a;-58,-33;-9j,-70;-v,-43;-e9,4v;-hb,i;-cq,5i;-ey,bh',
        ],
    ],
    [
        ['Cuba', 'Cuba', 'CUB', null],
        0,
        [
            '-1rh8,hw5;o0,-20;lt,-b;q3,-9h;b3,-a6;py,35;9u,-6j;nj,-h7;ha,-cj;95,e;gl,-5o;-21,-7u;kh,-15;l0,-bd;-3b,-6j;-ih,-3j;-ip,-1d;-j5,27;-13r,-2q;im,fi;-bc,78;-hw,1v;-9m,81;-6l,ft;-fp,-13;-pw,7g;-8d,5u;-107,4b;-9p,5f;af,6y;-r9,1f;-jy,-ef;-bj,-e;-3z,-6s;-dr,-32;-bw,2n;eo,8l;61,a1;ck,66;e6,5f;l2,2o;6q,32',
        ],
    ],
    [
        ['Honduras', 'Honduras', 'HND', null],
        0,
        [
            '-1s5n,bkk;-9j,k;-3v,-3s;-9n,-3n;-70,0;-65,-3j;-5l,19;-4q,49;-2x,-u;-3k,-6m;-2o,8;-g,-5q;-9p,-7n;-55,-3b;-2u,-3g;-87,5m;-60,-7f;-5t,7;-6i,-n;l,-do;-43,-9;-3h,-6c;-8n,-15;-4s,8p;-8g,2e;1x,b5;-3s,30;-5p,20;-c7,-3c;-11,3r;-8e,4h;-60,5j;-86,2c;5r,72;-27,5g;1y,5c;d6,7s;co,am;2w,-13;63,4v;7y,f;2l,-2a;4b,1e;cx,-2i;cu,q;8y,32;39,34;8v,-1f;6n,-1w;7a,n;5i,2f;cp,-3v;4f,-m;8h,-57;81,-68;a4,-49;7b,-7n',
        ],
    ],
    [
        ['United States of America', 'United States of America', 'USA', null],
        1,
        [
            [
                '-2ms8,11t4;26w,0;2ah,0;rb,0;2co,0;29y,0;2bc,0;2be,0;2me,0;2n1,1;1li,-1;3,ao;9e,5;4y,-f9;8n,-4p;je,-1q;sd,-4f;qy,-8m;mi,3m;y6,-78;93,a;ov,7v;q2,-a3;r6,-ar;mi,-99;lk,-8w;2p,-7b;6j,-2q;-1p,-2r;7g,-v;5f,2v;1e,-6l;5l,-4e;7n,0;42,-3e;-3f,-4y;sy,-d1;5x,-p8;5k,-o5;-84,-gf;-d2,-fa;-64,-9q;-m,-2w;34,-3z;9g,-4e;6z,0;w9,eu;sn,4d;10c,du;j,2t;-2i,8h;-4i,5g;ck,4f;ra,4;pi,0;8w,at;3h,26;td,k0;cj,54;167,7;1f7,1;2s,6v;8w,1e;bt,4b;9v,cn;8h,lm;l7,kz;98,-7b;in,4q;cc,-81;-1,-11v;i6,-fp;4s,-94;-to,-dh;-sj,-9l;-tc,-88;-ep,-gi;-4q,-69;-a,-eq;96,-eq;bj,-p;-2x,a5;8c,-66;-28,-7y;-ir,-4i;-dc,j;-kk,-4u;-c3,-1e;-g5,-1d;-n6,-82;14t,58;88,-59;-12w,-8c;-hp,-2;u,3f;-8h,-7p;87,-1a;-60,-jz;-k8,-ld;-22,74;-64,1g;-94,6z;5s,-ez;6w,-4y;f,-ai;-8w,-as;-fn,-m7;-2j,14;8l,iw;-e7,am;-39,n3;-5d,-c0;5y,-hn;-id,4d;j4,-8y;17,-qg;7z,-1x;2w,-9m;3x,-rs;-ho,-km;-sr,-89;-i9,-gb;-dv,-1s;-e3,-a7;-3z,-9c;-uh,-i1;-fo,-d8;-d3,-gh;-4a,-jq;4w,-ja;9a,-ns;cc,-jo;6,-c0;d5,-w8;-v,-iq;-18,-at;-6x,-gz;-8b,-3i;-do,3d;-4e,c7;-ak,6e;-eq,nw;-cx,l9;-46,av;5p,ig;-7s,fa;-lo,n9;-au,49;-s1,-cm;-4z,1e;-dh,cz;-hf,6v;-ve,-3i;-oo,33;-l6,-1x;-bi,-4c;50,-7e;-g,-b9;5w,-5i;-5a,-3n;-ab,43;-ag,-5a;-k5,w;-kr,eo;-o8,-3h;-k7,6g;-ha,-1y;-ne,-6i;-pa,-kl;-rm,-c0;-f6,-d9;-6e,-ci;-a,-j6;1e,-dc;5a,-9g;-au,-u;-jq,64;-lo,8m;-7s,d2;-64,jg;-ge,fu;-9m,ga;-dy,j1;-jk,b2;-mq,-j;-hi,-ly;-n2,8c;-ed,8e;-6x,fa;-97,ei;-gj,c8;-e7,8s;-a5,9v;-1c4,0;-2,-bh;-m1,0;-1j9,-7;-1rd,jk;-15y,di;2m,5g;-za,-31;-vl,-25;-4o,e7;-i0,fz;-cz,3c;-31,7z;-fl,1e;-9y,7i;-pt,2r;-73,4i;-3d,f8;-qz,rx;-n4,12m;z,6f;-c9,97;-li,na;-3u,mn;-et,f6;63,n1;-z,nu;-8v,la;av,q6;3d,p8;3e,p7;-51,11a;-8s,nr;-83,cw;3d,5g;146,-9g;et,-q8;6v,7c;-4g,ms;-9g,ms',
            ],
            [
                '-3bwq,fhs;4x,-2f;4j,-3q;73,-9q;-o,-1k;-av,-5x;-8w,-4d;-42,-4n;-6x,3z;t,7s;-4l,a4;1d,33;4u,4j;-1x,5h;1m,2l;24,-i;an,-4p',
            ],
            [
                '-3cd8,g0s;-2b,-3c;-9b,-20;-4t,5v;-37,29;-9,1r;2q,2d;9w,-2n;79,-49',
            ],
            ['-3cye,gc9;-v,-30;-ew,t;23,3e;do,-17'],
            ['-3dxl,gr9;2b,-1s;81,-97;-1i,-1m;-20,d;-9o,z;-3j,6b;-13,14;7g,3u'],
            ['-3eyu,h53;l,-6h;-3b,-2r;-9d,52;1g,21;49,2q;6e,-l'],
            ['-3kg4,1alc;m2,-2i;2n,-ao;-h2,-4c;-i7,57;-gv,7k;rf,4r'],
            [
                '-3a8d,18q9;ig,-1w;bs,-8m;-o1,-d7;-rr,-al;-e7,76;-4b,d0;p8,9w;eu,48',
            ],
            [
                '-30sa,1hsg;0,0;-6,-2v4;-6,-4e6;rd,-t;r2,-7p;je,-c6;op,-i9;r0,fj;rw,90;er,-ed;iq,-be;pf,-cj;he,-jx;se,-vp;1b8,-ho;s,-hj;-fg,-de;0,0;0,0;-fa,ag;-oh,8v;-7v,o8;-zt,mh;-ez,q8;-qo,1t;-186,o;-wk,80;-1lg,su;-ql,5a;-1cl,9w;-12h,-2d;-1in,cs;-x0,bu;-uu,-5w;5q,-jb;-fd,-1s;-w5,-5s;-og,-9e;-us,-5w;-3z,gd;ch,r9;tj,8k;-7m,6y;-zf,-fh;-iy,-ih;-141,-js;kb,-dh;-q8,-jz;-tv,-bm;-rt,-8h;-6w,-cb;-17d,-ec;-8s,-d2;-wi,-bv;-j3,25;-px,-7r;-s7,-9h;-n3,-9a;-1bp,-7y;-4c,4o;ue,cz;r6,8l;tm,f7;yg,35;dp,be;12j,gn;67,5k;ki,9t;4t,l2;e4,gf;-w1,-8f;-8y,4s;-f2,-a4;-i5,e3;-7h,-9y;-ae,du;-rs,-b4;-h2,1;-2e,gj;51,a7;-hw,9w;-104,-5c;-ng,d1;-j0,6o;-5,fr;-le,bu;ar,fz;mn,fi;9w,e9;mi,21;j2,-4g;me,df;k7,-2e;l5,8m;-55,cp;-fk,50;kk,aq;-h2,-c;-th,-62;-8h,-64;-lw,64;-13b,-34;-14o,6o;-bo,b6;-z6,g5;132,bm;1py,dl;mu,0;-3s,-dw;1mn,13;-mk,h8;-y6,ak;-jr,dw;-qn,bv;-126,8s;fj,ek;1da,x;z2,cn;6m,dj;se,d7;r2,37;1go,cc;pj,-1v;16r,et;161,-5u;k4,-ck;cc,5e;1ay,-1o;-1o,-6e;16i,-4q;sc,2s;1mj,-8s;1hf,-2m;le,-3m;10z,4j;164,-8d;u7,-3w;0,0',
            ],
            [
                '-3oic,1d7r;h6,-5b;hb,2v;mg,-7c;rm,-3p;-2b,-31;-l1,-5w;-l6,61;-ak,52;-oi,-1m;-6m,2g;1n,ah',
            ],
        ],
    ],
    [
        ['Canada', 'Canada', 'CAN', null],
        1,
        [
            [
                '-2ms8,11t4;-3q,3;-1hs,ra;-jv,c0;-1eb,bi;-fh,ol;3z,h2;-zk,bt;-4v,mf;-xm,k6;-l,eb;0,0;fg,de;-s,hj;-1b8,ho;-se,vp;-he,jx;-pf,cj;-iq,be;-er,ed;-rw,-90;-r0,-fj;-op,i9;-je,c6;-r2,7p;-rd,t;6,4e6;6,2v4;0,0;1ft,-6p;17r,-dd;sy,-2k;oe,bl;xn,8o;15a,-3e;15m,c8;19g,6x;j3,-bj;kq,6i;68,d3;j7,-2z;1az,-ow;10z,it;3r,-l2;y5,4k;ai,84;xn,-1m;16h,-bo;1t0,-a7;129,-4p;r7,1s;11h,-e3;-133,-ds;1e8,-5z;22z,3a;no,4v;tm,-go;u8,e2;-sd,bt;hy,9i;xt,1a;m8,2s;mf,-6n;rx,-f3;v1,28;1d3,-cj;174,4f;14j,-o;-38,ha;oq,4v;171,-9g;-6,-qa;hp,m6;mc,-r;ck,rx;-tr,h5;-wf,b8;28,up;wu,k6;10n,-4h;s4,-c9;11q,-vc;-on,-dn;1fo,-5m;-5,-sf;115,ls;x7,-hw;-89,-km;qv,-iq;t0,k2;k9,o0;1j,uh;13h,-25;152,-43;11b,-ds;1o,-ds;-ko,-et;jl,-ew;-3k,-di;-1ie,-jf;-12m,-4b;-sq,8d;-8b,-dy;-qr,-nf;-84,-c5;-w8,-it;-13r,-1u;-ly,-br;-1u,-i2;-wb,-3h;-y0,-mi;-u5,-va;-ar,-lx;-1k,-w9;14u,-4n;ci,-q0;d0,-l3;12v,5i;1fm,-c1;rs,-ak;jw,-d5;yt,-7n;tf,-bp;19v,-1m;u8,-2p;-4j,-o2;8n,-rx;k4,-v3;15c,-qe;le,92;f1,sk;-ei,17v;-jm,en;18h,d0;vh,jh;ff,jd;-2a,il;-iv,nl;-xr,kx;ws,t4;-c4,p5;-9a,17e;jc,6f;1bn,-7l;sk,-2p;n0,7b;pv,-9f;y8,-g4;8f,-as;1dk,-24;-u,-nc;98,-z4;pd,-4c;k5,-gd;148,ff;ql,uo;id,cx;ln,-ot;107,-zg;up,-xc;-b6,-hg;10y,-fo;oz,-fv;18b,-77;hu,-8u;b0,-nj;ln,-3p;b6,-ah;21,-v7;-k6,-ag;-jy,-9r;-19s,-9w;-yy,-mt;-1az,-4j;-1nf,5v;-15o,7;-ss,-1x;-n9,-jx;-zf,-cc;-143,-10r;-vz,-pn;nm,4k;18l,10i;1ma,n5;15k,2s;ol,-dn;-q8,-in;8s,-ty;93,-kz;103,-dv;19w,41;rv,v8;1x,-k5;hy,-a3;-yd,-i7;-1pj,-gj;-rk,-b8;-v1,-k1;-l3,22;-13,ni;1c9,mz;-18h,-x;-uv,-3d;-i6,fp;1,11v;-cc,81;-in,-4q;-98,7b;-l7,-kz;-8h,-lm;-9v,-cn;-bt,-4b;-8w,-1e;-2s,-6v;-1f7,-1;-167,-7;-cj,-54;-td,-k0;-3h,-26;-8w,-at;-pi,0;-ra,-4;-ck,-4f;4i,-5g;2i,-8h;-j,-2t;-10c,-du;-sn,-4d;-w9,-eu;-6z,0;-9g,4e;-34,3z;m,2w;64,9q;d2,fa;84,gf;-5k,o5;-5x,p8;-sy,d1;3f,4y;-42,3e;-7n,0;-5l,4e;-1e,6l;-5f,-2v;-7g,v;1p,2r;-6j,2q;-2p,7b;-lk,8w;-mi,99;-r6,ar;-q2,a3;-ov,-7v;-93,-a;-y6,78;-mi,-3m;-qy,8m;-sd,4f;-je,1q;-8n,4p;-4y,f9;-9e,-5;-3,-ao;-1li,1;-2n1,-1;-2me,0;-2be,0;-2bc,0;-29y,0;-2co,0;-rb,0;-2ah,0;-26w,0',
            ],
            ['-1st6,1c6t;ko,ct;125,-9;-l,-5e;-wj,-fc;-jm,n;-63,7j'],
            [
                '-1pk0,1k6b;-uk,eq;16,a0;dd,1v;1rl,-30;1bw,-f9;2h,-7p;-tj,u;-ty,l;-ue,-3r;-82,1p',
            ],
            ['-1pyz,1bwm;aq,8c;bd,-m;72,-5p;-aw,-em;-ca,2d;-7a,8a;1b,1y'],
            ['-208d,1lus;-f4,-as;-14c,23;-xo,79;es,ci;13y,7h;o9,-9r;a5,-8s'],
            ['-20eo,1ntc;-co,-t;-1g2,1s;-7e,7s;1jx,-f;ji,-56;-3b,-36'],
            [
                '-22nm,1ory;x7,-9o;-7j,-a1;-154,-5q;-mm,6g;-bx,af;-27,bi;zz,-14;g7,-1u',
            ],
            [
                '-1w0m,1leg;-18v,3g;-21t,8y;-9m,f9;-3e,ds;-rw,c4;-1lg,3e;-w7,8m;ag,be;1l9,-1r;uu,-8y;1ip,3;nz,-95;-6c,-ag;vw,-6a;hn,-6m;11h,-18;14j,-2c;185,61;1kl,2d;194,-1y;tr,-ah;68,-bi;-hc,-7e;-15f,-5z;-zk,3e;-27o,-4a;-1l1,-i',
            ],
            ['-2duo,1oax;136,-4d;-99,-8b;-1fs,-80;-157,8z;mh,8v;14l,2u'],
            ['-2dmc,1ot0;105,-5m;-xu,-5f;-1a5,1;g,3z;si,8b;ew,-1a'],
            [
                '-16wg,13lh;-eu,-hi;-ie,-ob;i5,9e;io,-5y;-9r,-9p;on,-7m;ct,6s;rp,-8k;-8l,-kc;jg,4r;3j,-er;8n,-h9;-bp,-oh;-ck,-11;-ia,59;61,mq;-7q,3j;-w9,-o3;-gk,z;jm,d2;-qo,6r;-tu,-1o;-1hx,u;-49,88;ha,9t;-c3,7j;nc,gr;sp,188;h8,ft;o4,9l;cw,-18;-5d,-7j',
            ],
            [
                '-1sq3,1e8m;uf,-9j;vu,-8o;2h,-d7;kg,25;ju,-97;-oo,-8r;-178,6p;-fm,ci;-rj,-es;-13j,-ee;-9k,g9;-11n,-2o;o5,dr;3k,lv;9h,pg;k3,-2a;55,-c7;e8,4a;g5,-7a',
            ],
            [
                '-1os3,1jts;qa,b2;1pn,-e2;129,-d9;3m,-c4;1fl,6a;sy,-hp;1v2,-az;o7,-b7;qa,-q0;-1f0,-cy;1tf,-i5;184,-63;13x,-pk;17p,-1u;-8n,-ji;-1cr,-w9;-y7,bv;-17o,qq;-zy,-3h;-3i,-fx;t7,-g6;11q,-cs;bg,-7d;i3,-ri;-9l,-jz;-z1,7j;-1xo,m9;139,-ny;sy,-gs;4i,-9p;-23b,b3;-1nm,g5;-xo,dj;9p,7u;-15g,ea;-14g,dh;f,-82;-28b,-4f;-ni,9j;ib,kg;1g7,i;1l6,3k;-9a,9x;9p,dv;zy,r2;-7n,ca;-aq,9i;-16j,di;-1ka,9g;hs,71;-te,ha;-oi,1k;-lw,9h;-ev,-87;-1ed,-3l;-2t4,68;-1mr,85;-192,47;-n3,9r;t1,co;-13g,5;-8t,s4;lc,ou;sl,bd;1zq,7e;-kg,-hz;lw,-hb;po,me;1ye,bf;1bo,-sq;-45,-i7;1iy,82',
            ],
            [
                '-20x4,1l7b;1lw,-z;1h2,-6r;-15i,-or;-x4,-5e;-tt,-kr;-vp,11;-hc,oe;g,dt;ei,bt;rk,7l',
            ],
            [
                '-2msn,1mqd;0,0;1b5,ks;1l2,hz;16m,-e;123,43;-3t,-lc;-le,-9n;-py,-1d;-1fn,-bw;-18h,-49;-11n,61',
            ],
            [
                '-2uee,15p4;qo,28;-8b,-vj;o6,-md;-b3,2;-gq,cq;-aa,cs;-e1,8n;-55,c8;1o,8v;d2,-3m',
            ],
            [
                '-29ec,1p6u;1ij,-3t;234,-a5;l9,-d7;at,-bl;-19d,33;-19q,90;-1pu,11;qu,89;-xm,6p;-20,ao',
            ],
            [
                '-2nau,11fi;-dz,-3v;-19m,cm;-8c,9v;-ov,9q;-50,7x;-sl,50;-aq,f4;2f,6g;t5,-62;h2,-48;q4,-2y;9g,-9l;dq,-d7;rq,-bh;bh,-fc',
            ],
            [
                '-2ls2,1lg1;13o,-5s;1yy,-1j;r0,-82;tt,-bp;-yx,-70;-1w4,-jj;-yg,-jg;0,-c4;-214,-de;-eo,c6;-1s5,ep;bx,br;j9,kb;o3,i9;-r6,h1;2lw,4c',
            ],
            [
                '-2b6z,1miu;oq,4n;t4,-18;4w,-dl;-gw,-d7;-2m3,-4b;-1y3,-c1;-169,-n;-3j,92;1lp,cb;-3hi,-3c;-12u,4z;11w,r5;q5,7s;266,-9e;1dd,-gg;1cj,-24;-13q,ql;pg,a4;so,-38;9e,-d8;aw,-9w',
            ],
            [
                '-2a6z,1kdw;v5,-b7;hf,-r3;8m,-jl;1ao,-dr;1e4,-d6;-30,-c8;-19m,-28;hq,-ao;-9d,-a7;-1ea,4d;-1bs,7i;-wb,-1p;-1g5,-9f;-1ye,-46;-1df,-2m;-f2,d3;-11x,7l;-oo,-34;-y8,m0;ih,2z;16w,4q;136,-19;109,4u;-1hq,6i;-1nd,-28;-13e,l;-en,a8;1sf,b4;-16v,-e;-1ci,7c;nb,kt;jd,b2;22d,gx;se,-5e;-dv,-d0;1pt,8e;12n,-e1;ve,e7;pd,-94;mr,-ra;dy,bi;-jq,sh;og,42;rl,-4g',
            ],
            [
                '-25hy,1k3m;-um,i6;ww,dg;x4,-5v;1dk,3j;78,-82;-py,-db;162,-bz;-50,-p0;-19k,-ar;-qr,2b;-j8,am;-1x1,lg;k,8w;1kq,-3g',
            ],
            ['-2a94,1ksg;118,14;l4,-64;-og,-ic;-17c,jg;9g,3w'],
            [
                '-2404,1n74;l8,-cv;w,-ea;-co,-kn;-19t,-2v;-tv,4g;l,g8;-19j,-25;-1s,lh;tw,-w;15v,9h;132,-1l;25,3n',
            ],
            [
                '-2234,1q6y;j9,8h;sh,1y;-c5,6d;1sl,1f;zh,-eu;1ar,-5y;19k,-59;ly,-ic;xi,-8z;-126,-8a;-1fb,-kw;-1d5,-20;-1ll,3k;-tu,bc;f,a3;lz,7e;-1et,-8;-um,99;-hm,cl;ja,cc',
            ],
            [
                '-1yo3,1r6u;15b,5b;wg,x;1ii,4i;14u,ac;yg,-1g;u0,-7s;l4,f0;10o,4g;1dt,33;2cx,15;er,-30;287,4p;1o6,-1r;1o6,-1s;229,-26;1nn,-3k;1eu,-7j;-18,-7f;-1vs,-c2;-1v7,-5n;-p5,-68;1oi,6;-1tk,-gv;-19a,-7v;-1bi,-mp;-1lb,-4m;-hp,-5o;-2c4,-2z;12b,-3h;-j7,-4z;mz,-dp;-qf,-9j;-16x,-7v;-d6,-av;-12t,-8b;3w,-6b;1bh,13;m,-6s;-228,-go;-20l,7o;-29m,-4b;-15c,3d;-1gj,1g;-3h,dc;1fd,6a;-dp,k2;gy,1y;22a,-bz;-11w,ht;-192,5c;mi,ar;1d9,6m;7w,9o;-138,av;-bt,eb;23y,-17;lx,-30;17d,a4;-1qk,38;-2p7,-1s;-1d4,9g;-n5,b8;-wg,85;-63,9h',
            ],
            [
                '-1m1c,1g1g;-i2,-87;-v5,-1e;-6x,dl;bs,fl;ph,3u;lp,-7p;b,-bw;-35,-3u',
            ],
            [
                '-229t,1hma;gx,-am;-ha,-9r;-11f,8f;-mn,-31;-11x,ch;og,8m;jf,c2;th,-7w;go,-50;8c,-5a',
            ],
            ['-1ds7,12hd;9m,2c;10j,-6z;se,-bl;u,-54;-dj,-i;-100,8q;-pu,d4'],
            [
                '-1de7,10ak;9r,-di;k5,-3q;pr,r;-do,-be;-aa,-1t;-z9,bt;-6y,9a;ai,8l',
            ],
        ],
    ],
    [
        ['Mexico', 'Mexico', 'MEX', null],
        0,
        [
            '-2idk,p3r;vl,25;za,31;-2m,-5g;15y,-di;1rd,-jk;1j9,7;m1,0;2,bh;1c4,0;a5,-9v;e7,-8s;gj,-c8;97,-ei;6x,-fa;ed,-8e;n2,-8c;hi,ly;mq,j;jk,-b2;dy,-j1;9m,-ga;ge,-fu;64,-jg;7s,-d2;lo,-8m;jq,-64;au,u;-as,-oe;-4v,-k0;-21,-117;-2o,-dl;4t,-f5;8m,-dk;5k,-lk;if,-ko;6i,-fv;av,-do;ti,-7d;bh,-bn;od,7s;l7,2t;kt,50;hh,4r;ho,bc;6m,g7;2b,nd;4s,84;iu,7a;td,6g;om,-z;gu,2d;6o,-5w;-y,-de;-ex,-gj;-6m,-gw;54,-4v;-46,-c0;-6y,-lo;-72,75;-5t,-h;-5a,-d;-9y,-gs;-52,3b;-3d,-1b;8,-43;-pp,b;-py,-1;0,-fn;-ck,-3;ac,-9a;aa,-6f;33,-60;4i,-1p;-p,-9g;-zo,-3;-dd,-mo;3y,-56;-38,-6j;-p,-83;-vf,tw;-ec,91;-mp,79;-fi,-21;-mb,-ag;-e0,-2q;-jn,7b;-kt,5a;-pz,cr;-kt,3w;-vg,cx;-n9,da;-71,7f;-fj,1o;-sf,8s;-bl,cp;-tu,fr;-dx,hj;-6m,dj;99,2q;-2v,7x;6e,77;5,9m;-9d,ch;-2i,b2;-9c,e1;-oh,rm;-rx,lp;-dj,hb;-nu,bd;-54,6s;48,h6;-e5,6h;-gf,di;-6x,je;-ey,29;-g5,en;-d0,di;-18,8p;-ey,ky;-9u,la;f,ao;-k3,b1;-9a,-18;-fu,7o;-4h,-bb;4m,-db;2p,-kv;9j,-bh;km,-j4;4l,-6k;48,-1z;3o,-9k;4y,e;5k,-hx;8g,-72;5x,-9u;hh,-e5;97,-pu;89,-c6;7q,-d1;1j,-en;de,-x;b5,-cn;a3,-ce;-o,-4z;-bp,-a8;-4x,5;-7c,gw;-i7,fu;-k1,df;-e7,72;x,kc;-48,f2;-d8,8m;-j4,ce;-3o,-3l;-70,79;-h5,6q;-gd,g5;21,23;bg,-1l;ab,ae;11,cj;-le,jt;-gb,7p;-a8,hd;-ab,i7;-cw,m8;-ba,oz',
        ],
    ],
    [
        ['Belize', 'Belize', 'BLZ', null],
        0,
        [
            '-1ws7,dqo;-8,43;3d,1b;52,-3b;9y,gs;5a,d;4,-43;59,-4;-g,-7k;-4i,-c1;2f,-4b;-2x,-9x;1r,-2o;-37,-e1;-5h,-7e;-50,-v;-5j,-9n;-8a,0;26,vd;8,m0',
        ],
    ],
    [
        ['Panama', 'Panama', 'PAN', null],
        0,
        [
            '-1nop,6ov;-3e,-43;6g,-gd;-58,-89;-8y,20;-3l,-di;-99,80;-5y,f0;6v,7f;-71,1x;-57,96;-du,7q;-c6,-1s;-5n,-9n;-b7,-70;-63,-z;-2q,-5s;d9,-f2;-7l,-3k;-40,-44;-cx,-1f;-4u,gl;-3m,-4q;-96,1n;-5l,b6;-be,1u;-78,39;-bx,-1;-v,-61;-37,47;1h,5j;2b,5m;-13,51;46,3b;-5s,44;-6,b7;ar,2h;9z,-9z;-l,-5v;b3,-19;2n,29;7n,-6u;do,21;bt,70;gv,5m;9i,8b;fc,-1n;-11,-2q;fh,-z;cd,-4s;92,-8d;ah,-7o',
        ],
    ],
    [
        ['Greenland', 'Greenland', 'GRL', null],
        0,
        [
            '-1030,1rr8;2la,gl;2pg,-19;zg,a9;2q6,2o;65w,-3h;4tr,-m1;-1fb,-ap;-2ya,-18;-45i,-2q;e0,-4y;2qb,32;2bp,-9l;1hx,8i;n3,-9z;-ui,-g5;1yq,ac;3qw,ar;2ba,-5d;fl,-bv;-358,-js;-fp,-6e;-2gs,-4t;1sc,-1c;-wi,-k9;-md,-i1;v,-uw;xd,-i5;-17e,-16;-19o,-8s;1f9,-eq;6j,-nm;-tp,-2k;zz,-nw;-1pp,-20;w7,-bb;-93,-9t;-136,-4a;-12q,-3;yt,-iu;d,-cd;-1iy,bi;-eb,-7g;11i,-6y;10e,-gz;aj,-md;-1di,-5d;-lf,ap;-yc,fz;9i,-iv;-wa,-em;218,-16;12a,-1j;-22g,-o6;-23i,-lx;-29b,-9l;-un,-4;-sq,-aq;-12n,-tb;-1nr,-jh;-j7,-15;-10z,-6u;-13x,-6i;-nt,-h6;-e,-jh;-e2,-i9;-19a,-m8;b6,-lp;-ch,-mz;-e8,-r4;-135,-1p;-151,mo;-1jj,5;-qy,f9;-ij,r4;-1c5,yk;-e3,i3;-3t,oz;-12h,pn;a0,kh;-ij,9s;rh,wh;15t,ac;az,bm;5t,lp;-vr,-9u;-f4,-45;-oy,-3y;-y3,92;-1v,iv;av,es;ps,f;1kp,-7e;-1br,hn;-ov,9i;-ro,-3w;-n7,6v;v1,pw;-gw,ad;-m2,j7;-xg,tg;-zd,at;c,bm;-22k,g9;-1mz,21;-228,-14;-1vs,-22;-w9,8v;-1ca,hh;20y,8q;1jx,1h;-3av,78;-1qm,bc;3u,at;2x6,dd;2tq,dc;ar,a4;-22z,9z;o8,b3;2o6,je;14f,2z;-bl,ch;1tt,7c;2df,4d;2dd,9;ub,-8o;21o,fb;1ub,-ae;130,-27;1lp,-91;-1u2,ez;3t,bw',
        ],
    ],
    [
        ['Bahamas', 'The Bahamas', 'BHS', null],
        1,
        [
            ['-1oxw,ko6;d2,28;ic,-u;u,-78;-ua,-4g;-1y,aa'],
            ['-1o0u,kv4;ly,-ci;-4t,-jr;-53,3k;g,ej;-cg,az;-2,37'],
            ['-1obz,jga;8d,-14;9q,-n2;5,-g4;-6t,-1e;-72,g0;-ae,82;61,hm'],
        ],
    ],
    [
        ['Trinidad and Tobago', 'Trinidad and Tobago', 'TTO', null],
        0,
        ['-1blc,8aw;fz,3m;5u,-z;-14,-kp;-n7,-32;-50,2i;82,7n;-k,az'],
    ],
    [
        ['Puerto Rico', 'Puerto Rico', 'PRI', null],
        0,
        ['-1f56,eab;e7,-2g;50,-5j;-74,-70;-kx,6;-g8,-z;-1m,bv;3x,43;mr,-6'],
    ],
    [
        ['Jamaica', 'Jamaica', 'JAM', null],
        0,
        [
            '-1nuq,e9n;ip,-2i;es,-6o;4l,-7m;-jj,-j;-8f,-4n;-fk,4h;-fw,a4;3c,6d;bp,1x;6b,-x',
        ],
    ],
    [
        ['Indonesia', 'Indonesia', 'IDN', null],
        1,
        [
            [
                '30so,-208;h,-2ij;h,-2ij;-or,mt;-s7,5l;-6v,-7x;-z7,-v;bt,mm;hi,7q;-79,u7;-dc,nc;-1hv,ni;-mw,2c;-15q,po;-87,-di;-ao,-2g;-6b,a7;-3,c2;-l8,dn;tx,a1;jt,-k;-2c,7d;-14o,2;-b0,gk;-ot,54;-br,dr;11g,6r;e8,91;18m,-be;4d,-ac;7s,-18x;sr,-gn;n7,th;vw,gr;op,1;nr,-9o;km,-9y;tt,-5b',
            ],
            ['2ofd,-6v1;2t,-5h;j,-8f;-i5,-kr;-ns,-64;-3c,3c;2i,9g;by,gy;rh,b1'],
            ['2vk2,-5bj;-2p,kx;4x,9z;5u,9e;6b,-85;-2,-d8;-eb,-ix'],
            [
                '2iyi,36y;-ft,-p4;kf,-qa;-4s,-cs;v5,-pq;-wx,-3a;-9a,-iy;18,-p6;-qq,-j0;-q,-ro;-aq,-16h;-43,9w;-vk,-ci;-b0,gz;-jt,1l;-dv,8w;-x1,-9z;-a5,dg;-i7,-1j;-mw,37;-49,119;-dv,7q;-dc,nr;-3v,ob;38,pr;gi,ig;4n,-ik;j0,-fp;hx,5n;hr,-20;g6,e2;dc,2g;qa,-7s;mn,5x;e9,12m;ap,9o;9n,vm;vx,-1;o3,-4o',
            ],
            [
                '2rtn,-25u;uk,-84;a4,-l8;-ng,bg;-n8,2b;-fo,-1u;-j8,10;6l,f9;yb,16',
            ],
            ['2pwb,-2xb;-j7,54;-5f,by;s4,1c;6w,-96;-ae,-98'],
            [
                '2qpo,1of;20,-f6;gf,-2g;2l,-bd;-1g,-oa;-ec,2q;-48,-gw;bg,-eo;-7s,-3c;-b8,hl;-89,zj;5m,m7;97,a4',
            ],
            [
                '2muo,ob;vy,16;rg,k6;4v,-67;-mc,-rk;-kv,-5c;-qr,5f;-1aa,-1e;-oa,-40;-3y,-l1;ov,-op;f0,cl;1ft,9g;-2b,-cs;-c3,41;-c2,-ga;-oh,-ar;qb,-zm;-53,-9k;oz,-w2;-9,-i9;-et,-86;-ax,9s;dg,mr;-ra,-ar;-6x,7o;3m,ar;-k1,ga;22,r2;-ij,-8g;2d,-we;15,-13q;-hm,-41;-by,85;7z,pl;-4b,qt;-bp,7;-8m,j1;bh,i7;3y,m2;dz,15v;5u,bg;nm,kn;lp,-87;z1,-3v',
            ],
            ['2ktj,-7wz;-10v,jh;pw,5h;em,-8h;9q,-8g;-1o,-7i;-bp,-j'],
            [
                '2lmm,-6l5;ih,24;ox,a7;-43,-fg;-15r,-7w;-10y,3g;-3,a5;m2,5s;hf,-8c',
            ],
            [
                '2j91,-6ga;h5,29;6x,-bt;-w5,-5l;-j8,-3q;-ey,8;9k,g0;f8,8;7g,9t;a1,-7e',
            ],
            [
                '2bpj,-4ye;3s,-9w;1h8,-2r;65,bg;1fj,-dd;a4,-i0;15o,-53;y3,-gi;-vp,-al;-uk,b7;-p5,-r;-su,22;-q0,4z;-w6,am;-ke,2r;-bk,-3h;-1eo,bg;-4t,by;-pg,22;j3,qj;xp,-1n;mf,-av;bj,-24',
            ],
            [
                '28j6,-u5;4p,-jd;9p,-fi;ke,-2h;dj,-hl;-70,-yk;-13,-16y;-us,-l;-ne,n8;-zo,mp;-bw,gu;-l1,mm;-ds,ku;-l5,12w;-oe,n5;-86,nw;-a9,lp;-p1,hh;-ej,ns;-kx,fk;-sz,um;-2g,e5;hw,-14;170,-5e;ok,-r6;li,-iu;fb,-bk;qb,-tv;s9,-f;nc,-j1;g3,-na;l5,-co;-b4,-mp;fx,-9n;9z,-q',
            ],
        ],
    ],
    [
        ['Malaysia', 'Malaysia', 'MYS', null],
        1,
        [
            [
                '2586,4zk;4u,4z;mo,-c6;26,-ea;ic,3c;93,bf;6e,-2m;gf,-gs;bn,-il;1m,-ip;-2z,-cn;2p,-9k;21,-gg;9t,-7o;ax,-ok;-j,-9e;-jp,-1v;-qa,kl;-wv,m2;-39,e5;-g3,il;-3u,n0;-a0,f5;31,k9;-64,br',
            ],
            [
                '2iyi,36y;-o3,4o;-vx,1;-9n,-vm;-ap,-9o;-e9,-12m;-mn,-5x;-qa,7s;-dc,-2g;-g6,-e2;-hr,20;-hx,-5n;-j0,fp;-4n,ik;kd,-9i;lh,57;5l,ni;bv,59;xb,60;jx,m0;dn,hk;co,-ee;5u,9g;d9,-v;1n,hq;19,dp;le,jb;e0,lq;b9,3;e9,-e2;1a,-c3;ib,-7q;n6,-8d;-1z,-aw;-in,-1d;4y,-dl;-kg,-9g',
            ],
        ],
    ],
    [
        ['Cyprus', 'Cyprus', 'CYP', null],
        0,
        [
            'p98,r44;58,-1g;7j,2d;5d,-a;20,-1q;k,-2t;1e,13;45,-l;5b,24;30,-z;v,-29;-sh,-ba;-dm,3m;-6h,b5;d7,11',
        ],
    ],
    [
        ['India', 'India', 'IND', null],
        0,
        [
            '233j,lt2;24,-aj;-9r,-54;2a,-h3;-jv,51;-zy,-j7;u,-fx;-fc,-nb;-1e,-dj;-ce,-mw;-lq,6c;-13,-sr;-6a,-9h;2y,-bt;-dp,-6l;-en,182;-7o,-3;-4k,-hr;-f7,ef;8l,ft;cf,1l;ct,nj;-g0,4q;-ps,-e;-qf,3t;-2h,jb;-d9,1d;-m0,c1;-9t,-iv;k2,-ep;-he,-ad;-66,-a4;h4,-7g;-4q,-gr;9m,-kw;4c,-mv;-3z,-a5;-ix,c;-y8,-5r;1l,-kx;-eu,-gf;-13z,-ip;-v3,-wp;-kw,-hj;-ro,-i6;-2,-cs;-du,-6v;-p1,-9y;-cz,-1h;-8c,-l7;5s,-104;1h,-n2;-br,-qe;-5,-1b7;-ed,-1c;-co,-l7;8h,-95;-pc,-7w;-9d,-iw;-b5,-7z;-qb,px;-cv,12x;-ao,s0;-9q,d5;-er,qp;-6w,yr;-4t,hc;-pa,126;-bi,1hu;-8b,zj;3,xo;-5d,q0;-14g,-gn;-jl,3c;-10a,xo;dd,a2;-87,aw;-wl,nl;ii,ij;1p4,-2;-5i,nu;-fm,e3;-36,le;-i7,ch;um,t4;wa,-24;t2,t5;hf,s6;qy,rw;-f,jt;np,g2;-mf,dq;-9o,is;-9u,od;dm,bz;165,-6s;uz,45;qt,nc;tv,-wk;-2t,-mo;b2,-e8;-x,-e6;-jy,3q;7t,-um;ra,-hl;12m,-jg;-hm,-cl;-at,-q0;qx,-ai;q7,-dn;108,-fk;123,-3m;g1,-e5;lg,-2n;xf,-6h;n5,h;37,az;-3o,ho;25,bz;gy,5u;2c,-lw;m,-5k;p9,-ak;hg,4d;nh,-1v;mn,t;1z,h3;-bb,8v;me,3h;pa,ko;w1,ho;nb,-6t;jt,bp;d1,-ha;-9e,-bo;ty,-45',
        ],
    ],
    [
        ['China', 'China', 'CHN', null],
        1,
        [
            [
                '2cgz,e1i;-ms,8m;-t,nw;dp,cl;ud,7s;fz,-n;67,-am;-c7,-c8;-6g,-g2;-o0,-dc',
            ],
            [
                '1pxg,woe;-28,fu;j2,78;-p0,1ca;1j1,b3;e8,67;k1,1dq;1j4,-95;fg,ck;1c,rv;n3,2l;l5,ii;av,2a;7b,-je;nc,-eq;13n,-af;j6,-me;-ap,-wg;a0,-c2;x0,-4r;11f,-3w;xk,-hb;h6,-33;cn,-pm;gb,-gh;un,n;1lc,-68;10y,3v;rf,-45;153,-gw;xm,1;cb,-8n;wc,ex;18w,9o;15n,11;wg,9s;jy,ew;jg,9c;-4i,96;-8w,ao;el,hx;fn,-2i;sk,-5n;ro,er;16d,ar;kd,id;jk,7x;14c,3o;lx,-34;32,9v;-p6,jf;-mb,8w;-lc,-a9;-rf,4b;-fq,-3i;-76,bc;jn,rs;dj,ky;xc,-ai;135,hk;-9,c8;p3,th;fg,8w;-c,fc;-f9,6m;my,dt;yj,51;10t,r;15l,-8a;oe,-a8;h6,-s1;af,-by;9o,-h2;aa,-r8;1cd,-8v;ww,-jr;b9,-q4;168,-1;o3,ay;19w,87;-el,-p0;-at,-a6;-9i,-uf;-ip,-r1;-xq,4x;-nu,-9t;7c,-ns;-40,-wu;-e7,-r;6,-e4;-hy,ge;-b1,-fk;-16x,-bz;4c,-en;-o0,10;-d7,8q;-j3,-jq;-um,-ex;-mm,-hu;-12u,-82;-kh,-d0;-tw,-7l;er,cw;-5t,at;m0,io;-ep,ek;-o7,-9t;-vd,-jb;-h5,-hy;-r8,-1c;-e6,-cy;en,-it;mq,-4k;y,-ch;lz,-84;v4,ju;oo,-at;hz,-r;4i,-ej;-13c,-7s;-cz,-f0;-r0,-dx;-ea,-jg;tx,-fa;aw,-rb;gx,-ph;iv,-lc;-g,-kn;-hg,-7l;6o,-et;gc,-8m;-4a,-mn;-72,-m0;-fi,-2i;-kb,-u3;-mi,-10g;-ps,-x6;-127,-pm;-12n,-ne;-vb,-37;-gz,-cc;-9m,90;-fq,-dt;-12t,-dx;-tf,-49;-9h,-tc;-fe,-1n;-7a,k6;6k,ar;-119,8w;-d5,-4j;-rz,78;-d8,ba;4e,g0;-pe,53;-de,af;-no,-et;-r0,-37;-m6,5;-ex,-6s;-ee,-43;47,-vs;-et,s;-2i,6j;-u,bh;-kd,-83;-c2,54;-km,af;83,n3;-hl,5e;-6n,pk;-tb,-4m;3c,wz;qb,n7;14,mx;-t,l9;-c5,6m;-9a,gd;-g9,-22;-ty,45;9e,bo;-d1,ha;-jt,-bp;-nb,6t;-w1,-ho;-pa,-ko;-me,-3h;-c6,7h;-eo,o;-jv,6f;-f0,-71;-ie,-ko;-2c,lw;-gy,-5u;-wd,2p;-vg,6e;-mj,c7;-ll,5h;-9c,dc;-fm,40;-s1,i3;-ma,8k;-bj,-6o;-12m,jg;-ra,hl;-7t,um;jy,-3q;x,e6;-b2,e8;2t,mo;-tv,wk;-19o,b8;-88,ld;-kj,cy;-4y,7z;-46,fu;z,at;-gv,6c;-95,-2t;-72,pp;7x,6d;-3u,6i;qj,d4;j7,5g;te,-3q;ai,hq;zn,3b;9x,b1;17r,f2;3x,6a',
            ],
        ],
    ],
    [
        ['Israel', 'Israel', 'ISR', null],
        0,
        [
            'rk8,p8l;-4u,-8r;-a2,3v;-5t,-ii;6z,-35;-73,-3t;-18,-7c;d3,3s;n,-at;-du,-18f;-2s,78;-fi,14i;0,0;0,0;83,96;-1w,1l;7d,cz;5m,ky;3z,72;s,a;9b,-2;2k,4v;7g,d;f,-bd;-3r,-48;j,-7',
        ],
    ],
    [
        ['Palestine', 'Palestine', 'PSE', null],
        0,
        ['rba,oap;-d3,-3s;18,7c;73,3t;-6z,35;5t,ii;a2,-3v;-1,-gz;-43,-86'],
    ],
    [
        ['Lebanon', 'Lebanon', 'LBN', null],
        0,
        [
            'rn1,pod;-7g,-d;-2k,-4v;-9b,2;9w,mm;du,jl;i,z;ci,-1f;4k,-aw;-f6,-ah;-6t,-f8',
        ],
    ],
    [
        ['Syria', 'Syria', 'SYR', null],
        0,
        [
            'rk8,p8l;-j,7;3r,48;-f,bd;6t,f8;f6,ah;-4k,aw;-ci,1f;-2l,l9;6t,bg;7g,63;7f,63;1i,fi;94,-5f;ul,7q;es,-58;mv,3;vy,af;ez,-h;vm,4c;-e9,-hc;-f7,-6v;2m,-kb;-ai,-xl;-1pi,-sw;-1ie,-tm;-uy,b0',
        ],
    ],
    [
        ['South Korea', 'South Korea', 'KOR', null],
        0,
        [
            '2pcv,t4m;1q,2i;cf,-z;at,cj;jn,1d;bu,1t;40,6q;nz,-ws;6v,-i0;8,-w0;-ah,-fa;-p5,-5c;-m7,-bi;-p1,-2e;-34,f5;55,ku;-ca,sw;kn,4p;-j1,ns',
        ],
    ],
    [
        ['North Korea', 'North Korea', 'PRK', null],
        1,
        [
            ['2sws,wks;0,0;0,0;0,0'],
            [
                '2ssw,wpn;0,0;3w,-4v;-ak,1o;-c2,-9f;-8b,-9g;12,-jy;-ed,-65;-4y,-4x;-ah,-87;-ii,-4l;-c2,-7g;-v,-c1;-39,-33;b2,-4i;fr,-c7;-40,-6q;-bu,-1t;-jn,-1d;-at,-cj;-cf,z;-1q,-2i;-di,5a;-3d,-58;-85,-2b;-z,58;-77,2k;-7h,4f;7m,c8;6k,3a;-2h,53;72,ez;-1u,4j;-g8,31;-d3,7g;mm,hu;um,ex;j3,jq;d7,-8q;o0,-10;-4c,en;16x,bz;b1,fk;hy,-ge',
            ],
        ],
    ],
    [
        ['Bhutan', 'Bhutan', 'BTN', null],
        0,
        [
            '1yr5,lfg;bb,-8v;-1z,-h3;-mn,-t;-nh,1v;-hg,-4d;-p9,ak;-m,5k;ie,ko;f0,71;jv,-6f;eo,-o;c6,-7h',
        ],
    ],
    [
        ['Oman', 'Oman', 'OMN', null],
        1,
        [
            [
                '16lk,his;q,b7;84,bi;3,bd;ck,5h;-4x,3v;2a,i3;e7,4;cg,-iz;fi,-a3;ke,-3n;gg,-52;ck,-fy;7h,-98;9y,-3i;-2,-67;-a4,-gk;-4g,-7t;-bp,-8w;-ad,-j1;-cm,1g;-5s,-6m;-4g,-e3;3f,-ik;-2n,-3f;-cs,3;-hc,-ae;-2q,-dj;-6c,-5v;-hb,8;-av,-70;5,-b8;-dg,-7p;-fc,2m;-ik,-9d;-cu,-1l;-93,jf;-lq,19u;2bc,rs;ij,1jk;-cr,jo',
            ],
            ['17et,jub;-5a,9g;83,9h;3g,-2f;-2n,-bh;-3m,-51'],
        ],
    ],
    [
        ['Uzbekistan', 'Uzbekistan', 'UZB', null],
        0,
        [
            '176o,vvh;-13,2uf;1zi,gf;57,-2f;172,-jw;mq,-ai;qj,-p2;wl,42;1bn,26;x9,-ka;-23,-rv;dk,-7;5n,-ms;zc,-w;7m,-d6;ac,7;c6,jv;10n,jd;fx,55;89,-2q;-nb,-i0;ki,-ag;js,6x;wx,-en;-zk,-k0;-l5,2q;-bh,-p;-3z,7p;5t,cw;-116,-6g;-8t,-hu;-d8,-fd;-n7,1b;-77,-c8;ke,-6m;60,-kp;-fm,-s4;-ky,5v;-fh,7;r,h0;-10y,bw;-t2,dl;-i4,d3;-vs,j7;-dn,sn;-9c,51;-u1,-1a;-an,5p;-2z,m6;-11f,ep;-ne,-g5;-nr,-9l;4k,-e0;-vc,-d',
        ],
    ],
    [
        ['Kazakhstan', 'Kazakhstan', 'KAZ', null],
        0,
        [
            '1veo,11z3;-l5,-ii;-n3,-2l;-1c,-rv;-fg,-ck;-1j4,95;-k1,-1dq;-e8,-67;-1j1,-b3;p0,-1ca;-j2,-78;28,-fu;-h4,43;-dy,9z;-158,2x;-1a2,r;-a3,-32;-13k,bo;-fs,-5r;-4b,-ge;-19p,9k;-ib,-3x;-68,-c6;-fx,-55;-10n,-jd;-c6,-jv;-ac,-7;-7m,d6;-zc,w;-5n,ms;-dk,7;23,rv;-x9,ka;-1bn,-26;-wl,-42;-qj,p2;-mq,ai;-172,jw;-57,2f;-1zi,-gf;13,-2uf;-e9,-1d;-jg,ls;-is,7s;-vj,-5s;-ca,-99;-1k,6s;6u,bl;-5b,9o;-w7,9h;-cj,oy;-fc,71;-x,92;r1,-2n;12,kb;nm,4i;oa,-45;50,r4;-4y,h6;-rt,-1c;-nm,6s;-w6,-c8;-px,-5u;-e4,4i;2u,eb;-hq,ik;-km,-s;-nl,iu;g2,l2;-84,5o;m5,uj;sl,-g4;3g,ka;1ld,u8;17e,q;1p8,-j9;ww,-b8;th,bq;181,k;zj,-ef;83,89;130,-17;6z,d6;-190,j3;qn,dk;-57,7k;qo,78;-k2,j1;cr,9h;2vy,9o;dk,6v;1xi,a9;oz,bj;1dx,-5z;8r,-st;t0,6s;zp,-9h;-2b,-f6;qn,1l;1xm,q8;-a6,-8q;zg,-lh;1q3,-1yj;es,ej;12a,-g0;13x,75;fc,-50;dd,-g2;jg,-5e;bt,-bs;zs,3q;er,-h0',
        ],
    ],
    [
        ['Tajikistan', 'Tajikistan', 'TJK', null],
        0,
        [
            '1gc6,snt;fm,s4;-60,kp;-ke,6m;77,c8;n7,-1b;d8,fd;8t,hu;116,6g;-5t,-cw;3z,-7p;bh,p;-a6,-8k;-u8,4n;-2n,-g0;u4,25;yc,-91;1gi,48;72,-pp;95,2t;gv,-6c;-z,-at;46,-fu;-sn,2;-j5,21;-hb,-cf;-cc,-2s;-9o,-5u;-b0,94;2l,nc;-8f,1b;31,8i;-f1,6b;-bz,-9o;-2x,-b7;-4a,-43;-gm,l;-8z,-cq;-9d,5d;-k3,-8x;-8i,3e',
        ],
    ],
    [
        ['Mongolia', 'Mongolia', 'MNG', null],
        0,
        [
            '1vpj,121d;tb,4u;1h0,nx;169,d2;o5,-8j;t0,-e;ik,-d0;rq,-10;146,-6z;r0,jc;-ba,gd;sr,ss;v5,-bh;p7,-39;wo,-75;5b,-kt;13h,-bp;q9,55;z5,3n;ru,-3o;r7,-dc;gv,-e7;pr,a;z0,-4j;pj,6w;10l,4m;14o,jk;go,-30;ek,-9b;x5,2c;-dj,-ky;-jn,-rs;76,-bc;fq,3i;rf,-4b;lc,a9;mb,-8w;p6,-jf;-32,-9v;-lx,34;-14c,-3o;-jk,-7x;-kd,-id;-16d,-ar;-ro,-er;-sk,5n;-fn,2i;-el,-hx;8w,-ao;4i,-96;-jg,-9c;-jy,-ew;-wg,-9s;-15n,-11;-18w,-9o;-wc,-ex;-cb,8n;-xm,-1;-153,gw;-rf,45;-10y,-3v;-1lc,68;-un,-n;-gb,gh;-cn,pm;-h6,33;-xk,hb;-11f,3w;-x0,4r;-a0,c2;ap,wg;-j6,me;-13n,af;-nc,eq;-7b,je',
        ],
    ],
    [
        ['Vietnam', 'Vietnam', 'VNM', null],
        0,
        [
            '28i6,83b;o2,b6;t6,21;-c7,gu;1ao,ld;3g,xb;-6g,ii;52,rs;-70,jn;-l1,jb;-hi,oh;-n3,wu;-xa,gm;7y,a0;hs,7a;-as,o8;-y7,8;-ch,p8;-g9,ly;ex,6s;m6,-5;r0,37;no,et;de,-af;pe,-53;-4e,-g0;d8,-ba;rz,-78;-113,-nr;-n5,-q9;-64,-ja;l9,-ta;pz,-10b;p7,-h5;gw,-mb;cq,-1ff;-3r,-1cv;-n6,-ib;-vt,-hw;-mo,-n5;-yn,-pv;-a3,ht;7t,it;-km,ft',
        ],
    ],
    [
        ['Cambodia', 'Cambodia', 'KHM', null],
        0,
        [
            '275l,9ej;-6l,xj;hs,n4;zx,5b;q2,-40;mx,-aw;ck,j6;on,-a9;6g,-ii;-3g,-xb;-1ao,-ld;c7,-gu;-t6,-21;-o2,-b6;-n9,42;-ba,eh;-e2,sp',
        ],
    ],
    [
        ['United Arab Emirates', 'United Arab Emirates', 'ARE', null],
        0,
        [
            '13ss,iph;4x,1d;11,-7m;lr,4d;mz,-q;gs,-t;j1,is;kq,ht;hk,h4;5a,-9g;3s,-ly;-e7,-4;-2a,-i3;4x,-3v;-ck,-5h;-3,-bd;-84,-bi;-q,-b7;-5l,-5v;-2bi,e0;-an,s5;-12,6f',
        ],
    ],
    [
        ['Georgia', 'Georgia', 'GEO', null],
        0,
        [
            'utv,xij;3e,3a;nh,-4r;14w,-4i;11u,-db;4v,-56;gv,4d;pw,-5t;8i,-bf;hh,-6f;-78,-3u;dp,-f1;-3s,-3a;-ez,1o;-kq,7z;-6t,-4j;-12l,-4c;-qr,dn;-tm,-1b;45,bv;-6y,iy;-g2,a9;-fe,37;-a6,8i',
        ],
    ],
    [
        ['Azerbaijan', 'Azerbaijan', 'AZE', null],
        1,
        [
            [
                'zt1,wat;7t,-y;j3,-gv;cb,-1x;4r,73;gl,b7;em,-en;e5,-jp;cy,-1b;8k,-7h;-mw,-29;-4u,-ll;-4s,-9q;-a6,-6i;q,-dr;-6x,-1e;-hb,ek;9l,dr;-88,85;-af,-22;-wr,-kh;-n,j9;-cg,4k;-bt,7k;7u,8u;-et,9k;5l,6y;-al,4t;-5r,7b;6t,4j;kq,-7z;ez,-1o;3s,3a;-dp,f1;78,3u',
            ],
            ['zls,tw5;-j2,3p;-e1,cu;-4f,ah;5s,r;88,-7g;ca,2;-5,-4a;bd,-g3'],
        ],
    ],
    [
        ['Turkey', 'Turkey', 'TUR', null],
        1,
        [
            [
                'yjp,soi;-dc,-4o;-9r,72;-wb,3l;-bx,-4b;-vm,-4c;-ez,h;-vy,-af;-mv,-3;-es,58;-ul,-7q;-94,5f;-1i,-fi;-7f,-63;-7g,-63;-a8,cl;aj,ag;-gy,-2e;-n8,6f;-j4,-g0;-166,-34;-mh,ew;-ty,y;-6f,-bj;-j7,-3b;-qv,et;-uc,-i;-gg,rm;-kb,ff;dj,lm;-hm,da;ut,qk;16s,14;bo,l4;1gy,-3o;xe,i0;wd,7v;19z,l;1ch,-jl;13v,-aq;wd,4a;nw,-2h;wt,ei;tm,1b;qr,-dn;4q,-9s;-2p,-di;ko,-6x;ay,-84;-j1,-7x;8o,-vv;-5f,-8l;f7,-ma;0,0',
            ],
            [
                'k5h,w9v;sb,8q;nx,-3q;3b,-ao;o8,-8z;-52,-6t;-wz,-1j;-bv,-8l;-n6,-ez;-8r,cy;e,5q;6m,34;8l,he;-dj,7d',
            ],
        ],
    ],
    [
        ['Laos', 'Laos', 'LAO', null],
        0,
        [
            '2auv,ayi;-on,a9;-ck,-j6;-mx,aw;91,cj;19,ni;-mi,o8;-1q,rf;-l5,mk;-l0,1x;-5l,-9o;-ga,-t;-8b,4w;-ta,-gl;-o,ox;6u,ta;-is,19;-1l,gp;-c1,8l;5x,a8;nn,i3;2i,-6j;et,-s;-47,vs;ee,43;g9,-ly;ch,-p8;y7,-8;as,-o8;-hs,-7a;-7y,-a0;xa,-gm;n3,-wu;hi,-oh;l1,-jb;70,-jn;-52,-rs',
        ],
    ],
    [
        ['Kyrgyzstan', 'Kyrgyzstan', 'KGZ', null],
        0,
        [
            '1ir6,wm2;68,c6;ib,3x;19p,-9k;4b,ge;fs,5r;13k,-bo;a3,32;1a2,-r;158,-2x;dy,-9z;h4,-43;-3x,-6a;-17r,-f2;-9x,-b1;-zn,-3b;-ai,-hq;-te,3q;-j7,-5g;-qj,-d4;3u,-6i;-7x,-6d;-1gi,-48;-yc,91;-u4,-25;2n,g0;u8,-4n;a6,8k;l5,-2q;zk,k0;-wx,en;-js,-6x;-ki,ag;nb,i0;-89,2q',
        ],
    ],
    [
        ['Armenia', 'Armenia', 'ARM', null],
        0,
        [
            'zvu,twz;-a2,-u;-bd,g3;5,4a;-ca,-2;-88,7g;-5s,-r;-ay,84;-ko,6x;2p,di;-4q,9s;12l,4c;5r,-7b;al,-4t;-5l,-6y;et,-9k;-7u,-8u;bt,-7k;cg,-4k;n,-j9',
        ],
    ],
    [
        ['Iraq', 'Iraq', 'IRQ', null],
        0,
        [
            'u8r,otd;-b7,xu;1pi,sw;ai,xl;-2m,kb;f7,6v;e9,hc;bx,4b;wb,-3l;9r,-72;dc,4o;i0,-x4;i7,-8d;24,-g8;-e0,-9l;-6f,-lo;j8,-qf;y2,-f8;ea,-l4;-4k,-k4;8w,0;a,-et;fd,-el;-gh,1d;-io,2b;-ke,-qo;-1fo,28;-26b,1jv;-15e,jg;-xh,7j',
        ],
    ],
    [
        ['Iran', 'Iran', 'IRN', null],
        0,
        [
            '11h4,n3b;-fd,el;-a,et;-8w,0;4k,k4;-ea,l4;-y2,f8;-j8,qf;6f,lo;e0,9l;-24,g8;-i7,8d;-i0,x4;0,0;-f7,ma;5f,8l;-8o,vv;j1,7x;4f,-ah;e1,-cu;j2,-3p;a2,u;wr,kh;af,22;88,-85;-9l,-dr;hb,-ek;6x,1e;8t,-kh;qc,-5s;ja,-dy;13i,-4t;17e,7d;2o,6i;oe,5d;js,fw;ik,-t;c7,56;jr,-2k;uq,-e3;m7,-31;vr,-om;kp,-z;2g,-ne;-bc,-ym;-7n,-k8;c4,-43;-bw,-f8;94,-m6;26,-hn;l1,-4o;2a,-hw;-p7,-p7;dr,-em;b7,-gs;qk,-c7;r,-oh;db,-4i;2b,-cs;-143,-ed;-ah,-wa;-1g9,8e;-ua,6e;-vd,3m;-bu,y2;-db,4x;-lc,-4y;-s1,-dg;-xy,97;-s1,ld;-qr,7x;-ik,qd;-ki,111;-ey,-4i;-ho,97;-ad,-au',
        ],
    ],
    [
        ['Qatar', 'Qatar', 'QAT', null],
        0,
        ['137e,j3n;-1u,k7;7h,el;7l,30;8f,-8q;i,-g9;-61,-gd;-7q,-1z;-8e,5j'],
    ],
    [
        ['Saudi Arabia', 'Saudi Arabia', 'SAU', null],
        0,
        [
            'qz0,mnh;ux,-4g;c0,8k;6o,a0;l7,3v;4k,9b;97,4p;-rp,rs;1jn,dy;5a,47;xh,-7j;15e,-jg;26b,-1jv;1fo,-28;or,-2o;6x,-d9;jn,q;aw,-ny;do,-6d;4r,-9r;ix,-bo;1p,-bh;-2s,-99;3j,-9c;7z,-7s;3q,-94;45,-6t;8e,-5j;7q,1z;5a,-am;12,-6f;an,-s5;2bi,-e0;5l,5v;cr,-jo;-ij,-1jk;-2bc,-rs;-283,-an;-py,-ci;-jw,-t6;-cz,-4n;-6y,99;-an,-1e;-qv,2s;-53,2s;-w2,-n;-7j,-2i;-bf,78;-7d,-do;2u,-bp;-c7,-8v;-3l,bv;-8e,8d;-25,b3;-ed,9y;-et,nb;-7u,mm;-j7,j5;-ce,4k;-if,qh;-37,jb;16,gh;-fx,us;-d1,av;-f0,5q;-95,fx;1i,6b;-7p,ee;-84,67;-av,ko;-gx,mf;-e6,j2;-du,-4;4c,f8;18,9q;3g,b4',
        ],
    ],
    [
        ['Pakistan', 'Pakistan', 'PAK', null],
        0,
        [
            '1o25,rdy;-qt,-nc;-uz,-45;-165,6s;-dm,-bz;9u,-od;9o,-is;mf,-dq;-np,-g2;f,-jt;-qy,-rw;-hf,-s6;-t2,-t5;-wa,24;-um,-t4;i7,-ch;36,-le;fm,-e3;5i,-nu;-1p4,2;-ii,-ij;-kd,71;-8b,jz;-lg,l5;-1f7,-58;-194,-j;-135,-3w;ah,wa;143,ed;-2b,cs;-db,4i;-r,oh;-qk,c7;-b7,gs;-dr,em;1ak,-e6;rs,45;gm,-3j;5m,63;jd,-2g;103,bk;z,nn;fi,fq;ko,-2;32,7s;l8,3m;aa,-2l;av,7t;-1j,gp;bs,gr;hp,72;-ax,id;qf,-v;7n,a0;-16,ao;du,bo;-36,du;-6l,br;g8,c4;tu,5u;vw,38;e4,55;g6,34;kj,-cy;88,-ld;19o,-b8',
        ],
    ],
    [
        ['Thailand', 'Thailand', 'THA', null],
        0,
        [
            '296r,b0h;-q2,40;-zx,-5b;-hs,-n4;6l,-xj;-oy,cr;-nr,-j;42,lu;-og,-6;-27,-uk;-f0,-14l;-91,-oj;1w,-k4;i4,-v;ba,-pd;4z,-o1;fi,-fx;gu,-38;ee,-ef;-93,-bf;-ic,-3c;-26,ea;-mo,c6;-4u,-4z;-az,ao;-4r,dr;-es,fp;-dg,d6;-4k,-gb;-5a,ff;31,hc;87,qn;dg,sk;f9,pw;-av,pc;g,cw;-36,fj;-ij,m2;-6n,dy;9l,54;a6,o6;-bd,ic;-hn,ka;-df,od;bq,52;co,u1;jm,19;g7,c2;fx,6f;c1,-8l;1l,-gp;is,-19;-6u,-ta;o,-ox;ta,gl;8b,-4w;ga,t;5l,9o;l0,-1x;l5,-mk;1q,-rf;mi,-o8;-19,-ni;-91,-cj',
        ],
    ],
    [
        ['Kuwait', 'Kuwait', 'KWT', null],
        0,
        ['110n,n4o;5s,-ca;-2h,-6c;8y,-ky;-jn,-q;-6x,d9;-or,2o;ke,qo;io,-2b'],
    ],
    [
        ['Timor-Leste', 'East Timor', 'TLS', null],
        0,
        [
            '2ofd,-6v1;39,6k;nx,69;je,y;8o,3h;aj,-3g;-a8,-7j;-sy,-c6;-n9,-7z;-j,8f;-2t,5h',
        ],
    ],
    [
        ['Brunei', 'Brunei', 'BRN', null],
        0,
        ['2h2z,47c;-19,-dp;-1n,-hq;-d9,v;-5u,-9g;-co,ee;b0,ae;nn,f8'],
    ],
    [
        ['Myanmar', 'Myanmar', 'MMR', null],
        0,
        [
            '2590,fr6;-fx,-6f;-g7,-c2;-jm,-19;-co,-u1;-bq,-52;df,-od;hn,-ka;bd,-ic;-a6,-o6;-9l,-54;6n,-dy;ij,-m2;36,-fj;-g,-cw;av,-pc;-f9,-pw;-dg,-sk;-2p,km;8k,la;-9d,gg;2a,u9;-ba,ee;-92,x9;-51,z4;-c0,n0;-ib,-dy;-vl,-jt;-fl,2h;-h7,6j;9k,yf;-5s,q1;-ls,w0;3e,a1;-g9,3k;-jp,mo;-1u,mc;9p,-47;l,jx;dp,6l;-2y,bt;6a,9h;13,sr;lq,-6c;ce,mw;1e,dj;fc,nb;-u,fx;zy,j7;jv,-51;-2a,h3;9r,54;-24,aj;g9,22;9a,-gd;c5,-6m;t,-l9;-14,-mx;-qb,-n7;-3c,-wz;tb,4m;6n,-pk;hl,-5e;-83,-n3;km,-af;c2,-54;kd,83;u,-bh;-nn,-i3;-5x,-a8',
        ],
    ],
    [
        ['Bangladesh', 'Bangladesh', 'BGD', null],
        0,
        [
            '1zi9,h09;-l,-jx;-9p,47;1u,-mc;-7y,eh;-1m,e6;-5a,dd;-bm,g6;-pl,14;2j,-bg;-8q,-fh;-bu,5n;-41,-52;-7v,31;-ar,2i;-4c,mv;-9m,kw;4q,gr;-h4,7g;66,a4;he,ad;-k2,ep;9t,iv;m0,-c1;d9,-1d;2h,-jb;qf,-3t;ps,e;g0,-4q;-ct,-nj;-cf,-1l;-8l,-ft;f7,-ef;4k,hr;7o,3;en,-182',
        ],
    ],
    [
        ['Afghanistan', 'Afghanistan', 'AFG', null],
        0,
        [
            '1fbr,stv;fh,-7;ky,-5v;8i,-3e;k3,8x;9d,-5d;8z,cq;gm,-l;4a,43;2x,b7;bz,9o;f1,-6b;-31,-8i;8f,-1b;-2l,-nc;b0,-94;9o,5u;cc,2s;hb,cf;j5,-21;sn,-2;4y,-7z;-g6,-34;-e4,-55;-vw,-38;-tu,-5u;-g8,-c4;6l,-br;36,-du;-du,-bo;16,-ao;-7n,-a0;-qf,v;ax,-id;-hp,-72;-bs,-gr;1j,-gp;-av,-7t;-aa,2l;-l8,-3m;-32,-7s;-ko,2;-fi,-fq;-z,-nn;-103,-bk;-jd,2g;-5m,-63;-gm,3j;-rs,-45;-1ak,e6;p7,p7;-2a,hw;-l1,4o;-26,hn;-94,m6;bw,f8;-c4,43;7n,k8;bc,ym;sc,-aj;ky,3p;5t,cl;lx,47;fn,8g;5k,m8;nf,5d;4d,9w;d3,-7f;8e,-v',
        ],
    ],
    [
        ['Turkmenistan', 'Turkmenistan', 'TKM', null],
        0,
        [
            '14ie,w8n;ca,99;vj,5s;is,-7s;jg,-ls;e9,1d;vc,d;-4k,e0;nr,9l;ne,g5;11f,-ep;2z,-m6;an,-5p;u1,1a;9c,-51;dn,-sn;vs,-j7;i4,-d3;t2,-dl;10y,-bw;-r,-h0;-8e,v;-d3,7f;-4d,-9w;-nf,-5d;-5k,-m8;-fn,-8g;-lx,-47;-5t,-cl;-ky,-3p;-sc,aj;-2g,ne;-kp,z;-vr,om;-m7,31;-uq,e3;-jr,2k;-c7,-56;-ik,t;-js,-fw;-oe,-5d;-56,jn;41,t2;-lo,9f;75,j0;-ig,1n;65,nf;q7,-6u;of,8w;-k9,go;-7y,fw;-md,-73;-2u,-kd;-8p,i0',
        ],
    ],
    [
        ['Jordan', 'Jordan', 'JOR', null],
        0,
        [
            'rfe,ozu;4u,8r;uy,-b0;1ie,tm;b7,-xu;-5a,-47;-1jn,-dy;rp,-rs;-97,-4p;-4k,-9b;-l7,-3v;-6o,-a0;-c0,-8k;-ux,4g;-x,40;du,18f;-n,at;43,86;1,gz',
        ],
    ],
    [
        ['Nepal', 'Nepal', 'NPL', null],
        0,
        [
            '1vzs,lid;-25,-bz;3o,-ho;-37,-az;-n5,-h;-xf,6h;-lg,2n;-g1,e5;-123,3m;-108,fk;-q7,dn;-qx,ai;at,q0;hm,cl;bj,6o;ma,-8k;s1,-i3;fm,-40;9c,-dc;ll,-5h;mj,-c7;vg,-6e;wd,-2p',
        ],
    ],
    [
        ['Yemen', 'Yemen', 'YEM', null],
        0,
        [
            '144g,ens;lq,-19u;93,-jf;-k4,-7h;-5d,-cc;-o,-9h;-rn,-bq;-18e,-cy;-ow,-jm;-c8,-1j;-8c,1n;-g9,-bj;-hp,-5c;-nb,-1g;-71,-1l;-63,-7c;-7a,-21;-4a,-72;-dr,m;-8w,-3s;-j8,1f;-78,g8;s,f7;-4j,87;-5g,kj;-7z,bf;5k,1d;-2v,cp;3e,5d;-19,c4;c7,8v;-2u,bp;7d,do;bf,-78;7j,2i;w2,n;53,-2s;qv,-2s;an,1e;6y,-99;cz,4n;jw,t6;py,ci;283,an',
        ],
    ],
    [
        ['N. Cyprus', 'Northern Cyprus', '-99', null],
        0,
        [
            'p98,r44;1y,6;41,6p;k0,-e;p9,8b;-ir,-bu;21,-57;-30,z;-5b,-24;-45,l;-1e,-13;-k,2t;-20,1q;-5d,a;-7j,-2d;-58,1g',
        ],
    ],
    [
        ['Philippines', 'Philippines', 'PHL', null],
        1,
        [
            ['2l8i,9sw;-e7,l6;nt,-10;9n,-a0;-7d,-o0;-bw,du'],
            [
                '2ml6,7p9;6z,7s;32,h9;fc,1n;-4h,-iq;kk,qu;-2o,-qi;-9z,-95;-8p,-hk;-8q,-88;-h4,j7;5q,7g',
            ],
            [
                '2pih,6hr;2u,-ih;1m,-fl;-9g,-pf;-a6,sc;-cz,-e4;8v,-kg;-7y,-d1;-wp,g4;-7t,k4;8h,d8;-hm,d5;-8q,-bj;-d2,12;-kl,-fi;-4l,85;aw,nf;hi,7t;f6,ah;9t,-cl;l4,7m;4k,ce;jm,r;-1n,lh;mj,-d6;2c,-e0;1y,-a7',
            ],
            [
                '2jft,76s;-10z,-qd;dm,jg;k3,h5;go,j8;ek,rm;4z,-mo;-id,-fa;-ek,-j4',
            ],
            [
                '2me9,e29;-4j,-bj;9i,-jw;-7c,-n4;-gd,-97;-4e,-me;68,-m5;eq,-32;ca,3b;yp,-ff;-2n,-f4;92,-6o;-2w,-ct;-ln,dn;-a9,el;-76,-a7;-ho,gm;-p9,-43;-dt,65;1e,bh;8p,72;-8b,6g;-3l,-a1;-dq,fz;-45,c3;-11,qm;b6,-95;2w,17g;92,p6;gt,-1;h5,-7x;8k,78;2j,-72',
            ],
            ['2m5y,8t4;-4a,d8;go,-8m;ho,2;-j,-bm;-cv,-bt;-hn,-8c;-10,cx;1z,e6'],
            [
                '2ou7,9dv;7s,-v1;-lf,7d;l,-9b;6s,-h5;-d7,-68;-16,jj;-8d,1g;-4c,gt;gc,-27;-d,ai;-gz,l8;qo,-m;7o,-ad',
            ],
        ],
    ],
    [
        ['Sri Lanka', 'Sri Lanka', 'LKA', null],
        0,
        [
            '1r3w,5sz;-47,-sx;-bn,-7x;-o6,-6d;-d8,m3;-4x,13y;cl,193;j7,-fg;cx,-jk;dg,-sx',
        ],
    ],
    [
        ['Taiwan', 'Taiwan', 'TWN', null],
        0,
        ['2lyq,itm;-gq,-18j;-bx,-ms;-en,ng;-36,kl;gd,ra;m8,l1;co,-89;-4t,-gs'],
    ],
    [
        ['Japan', 'Japan', 'JPN', null],
        1,
        [
            [
                '31h9,u8d;-pq,-rz;h,-so;-ag,-m6;4u,-dx;-eh,-jl;-zh,-d2;-1cu,-1q;-13l,-vp;-io,ao;-16,ks;-1cb,-65;-wv,-d3;-wj,-j;s6,-kg;-ij,-1b8;-hz,-bo;-dg,as;6u,p1;-hl,83;-bb,j2;qa,8k;ek,hh;ry,ed;ke,iz;1ja,8b;tq,-5p;t2,1de;ij,-da;14r,rs;fs,at;hh,xz;-4s,v8;br,hk;tj,54;f5,-12j;-t,-mj',
            ],
            [
                '33l1,xx5;jo,bs;66,-v7;-157,-7m;-oc,-rl;-17p,j0;-f4,-ue;-uw,-f;-3t,rm;dq,ld;tp,1k;83,12f;88,ln;wn,-sx;lb,-9c;jj,-5x',
            ],
            [
                '2u4z,ptk;fd,gk;ft,-37;bf,bo;ke,-60;3k,-9j;-fn,-gt;-be,8x;-e9,-6g;-7d,-g9;-i4,7w;8,d7',
            ],
        ],
    ],
    [
        ['Chile', 'Chile', 'CHL', null],
        1,
        [
            [
                '-1gyi,-14m4;1,-1q1;tr,-1;gq,-r;-97,-b8;-nu,-8n;-dn,w;-gg,29;-k6,8d;-t4,40;-yy,fj;-sd,ex;-12a,v5;mx,-5u;130,-ik;10u,-9z;ec,cq;91,j1;pl,bh;js,-3a',
            ],
            [
                '-1hp2,-dkc;dm,-iw;3p,-k2;el,-br;-8r,-qw;ex,-v5;aw,-12b;k1,3t;3e,-6y;-9j,-sv;-ua,-dq;w,-1aa;-5t,-8y;8b,-aw;-jl,-ha;-i7,-q2;-9y,-p9;2n,-qw;-h4,-sl;ct,-1by;77,-53;-2,-pk;-fv,-r4;n,-n7;-l1,-i5;3,-pj;8g,-r4;-gn,-a3;-7f,-os;-6j,-sg;4p,-xv;-b6,-5o;6i,-w2;cj,-aj;-96,-bn;cw,-5l;2z,-ag;-c4,-5a;2z,-gb;-a5,-10s;-eq,-nq;38,-e1;-8t,-hn;-lb,-c7;2f,-th;9s,-a2;ii,1s;-j,-kt;bi,-g7;1v5,-3q;pq,-4c;-op,7;-de,-6u;-p2,-a1;-4h,-py;-bs,-n;-vc,91;-vt,jc;0,0;-yk,fw;-8p,hm;7v,ga;-dz,ih;-3k,1bc;bt,qq;tc,lh;-165,83;qg,ok;9g,1a5;uw,-9s;ei,1lk;-in,7d;-8o,-yo;-hj,3x;8q,13q;9h,1fh;cr,iz;-80,r4;-2a,vb;bp,w;h2,18v;j7,18g;bs,15e;-6f,15m;8b,mx;-3c,yb;g9,xx;50,1hq;8x,1lp;8p,1q4;-21,19h;-5t,134;eb,73;7g,e9',
            ],
        ],
    ],
    [
        ['Bolivia', 'Bolivia', 'BOL', null],
        0,
        [
            '-1hne,-8g8;ko,-2c;eb,l;67,8f;oa,b9;en,ag;10d,4p;-2z,-kt;3f,-ap;-28,-im;u6,-ow;v4,-4l;ax,-ae;is,-5i;bi,-82;hh,a;g5,-89;18,-g2;5f,-84;d,-bz;-84,-h;ap,-wc;1h9,-16;-43,-g1;2z,-az;f6,-7s;6l,-ha;-4y,-lw;-7m,-c6;2o,-fu;-8o,-5r;-h,8l;-pw,e7;-pt,e;-1ce,-83;-dc,-og;-p,-ey;-ay,-x9;-4h,5y;-vp,15;-au,-mc;-gc,k2;-10c,6s;-n6,-p4;-k1,-3t;-aw,12b;-ex,v5;8r,qw;-el,br;-3p,k2;-dm,iw;hi,tz;-by,nd;6e,9c;-50,ab;av,dv;k,nn;1d,jj;5z,9f;-o1,18p',
        ],
    ],
    [
        ['Peru', 'Peru', 'PER', null],
        0,
        [
            '-1hxi,-3be;-p1,1b;-3q,-47;-mr,-5c;-vs,-ix;-21,-cy;-73,-9o;2s,-f1;-gs,-81;1,-bq;-7c,-53;bk,-p0;fg,-gx;-5w,-bx;ig,-1m;ai,-eu;oj,-p;ms,gd;-1v,-167;cn,-37;fo,4s;o1,-18p;-5z,-9f;-1d,-jj;-k,-nn;-av,-dv;50,-ab;-6e,-9c;by,-nd;-hi,-tz;-7g,-e9;-eb,-73;-ru,fy;-2f,bf;-1j3,rw;-1dt,ud;-lf,h5;-bi,my;4k,80;-nj,10g;-re,1f9;-q9,1jb;-bd,co;-8r,kh;-lk,i4;-jt,b9;90,ce;-dh,qi;8n,jh;m5,hj;3b,-bk;-7x,-6m;r,-a7;bh,28;b8,-30;bo,-e1;fp,bf;59,ir;h1,o6;xf,ay;ua,t3;8n,i3;-3v,l3;7e,2n;ih,-d6;8w,-d4;cu,-75;ge,-t5;ko,-3h;fb,7c;a1,-4t;gp,2e;l9,-d0;-hx,-sa;8b,-o;dw,-er',
        ],
    ],
    [
        ['Argentina', 'Argentina', 'ARG', null],
        1,
        [
            [
                '-1gyi,-14m4;ao,-cw;dw,-ku;104,-go;12w,-6y;-ci,-dw;-qe,-1e;-e6,9t;-gq,r;-tr,1;-1,1q1',
            ],
            [
                '-18gp,-nbc;-6y,-m9;-7f,-sk;9,-ro;-61,-66;-25,-hy;-1w,-ei;z9,-nt;-3s,-j5;hd,-c4;-1f,-dl;-qp,-zm;-157,-ew;-1jp,-5s;-uj,2s;5u,-gk;-5p,-kt;55,-e0;-go,-9s;-sg,-3u;-qq,a4;-aq,-79;3v,-rm;is,-8d;f7,8r;8a,-ef;-pl,-8n;-mb,-h9;-43,-ry;-6k,-ew;-q9,-3;-ls,-e8;-7z,-ku;rc,-kc;qk,-5m;-9k,-ox;-wt,-fo;-i2,-wl;-pd,-ay;-be,-d1;8z,-su;ii,-g3;-bq,1f;-pq,4c;-1v5,3q;-bi,g7;j,kt;-ii,-1s;-9s,a2;-2f,th;lb,c7;8t,hn;-38,e1;eq,nq;a5,10s;-2z,gb;c4,5a;-2z,ag;-cw,5l;96,bn;-cj,aj;-6i,w2;b6,5o;-4p,xv;6j,sg;7f,os;gn,a3;-8g,r4;-3,pj;l1,i5;-n,n7;fv,r4;2,pk;-77,53;-ct,1by;h4,sl;-2n,qw;9y,p9;i7,q2;jl,ha;-8b,aw;5t,8y;-w,1aa;ua,dq;9j,sv;-3e,6y;n6,p4;10c,-6s;gc,-k2;au,mc;vp,-15;4h,-5y;1f2,-19c;mq,-48;xy,-ki;sm,-av;3z,-ca;-rc,-168;s0,-7k;v7,-48;lz,4g;p7,la;4k,oj;dr,5b;dy,-g1;-l,-m6;-ne,-fc;-in,-bb;-vd,-qz;-112,-11v',
            ],
        ],
    ],
    [
        ['Suriname', 'Suriname', 'SUR', null],
        0,
        [
            '-162l,1s8;-fx,5w;-d4,-2u;-b7,2g;-2s,-81;4n,-5j;-2i,-5o;-f3,2a;-gz,o5;-3n,fo;-8x,2;-cb,k6;55,ec;-1i,6k;gv,79;4g,oz;xa,-5k;2z,50;mh,20;tv,-7g;-eh,-nw;27,-j0;ax,-gh;-4v,-by;-2g,-cq;-73,-bo',
        ],
    ],
    [
        ['Guyana', 'Guyana', 'GUY', null],
        0,
        [
            '-17mj,1gs;-6s,-10;-fd,2d;-91,-7e;-ck,-4w;-8s,-17;-33,-5g;-dn,1e;-h3,d1;-21,cv;-74,e1;4g,nn;7p,9t;-6d,cx;-9k,47;3m,c7;-6h,6e;-eg,-18;-is,l3;7j,7n;-k,cu;h3,4h;6w,57;-9i,ab;2f,a5;m1,gb;i8,-a8;h7,-i3;s,-eb;ah,-o;ew,-dk;az,-9o;-4g,-oz;-gv,-79;1i,-6k;-55,-ec;cb,-k6;8x,-2;3n,-fo;gz,-o5',
        ],
    ],
    [
        ['Brazil', 'Brazil', 'BRA', null],
        0,
        [
            '-156m,-q20;-7p,fq;c9,d6;-g2,ix;-ls,fc;-sm,ht;-ab,-t;-rv,lh;-i1,-2y;112,11v;vd,qz;in,bb;ne,fc;l,m6;-dy,g1;-dr,-5b;5g,g1;3s,gf;0,fa;-a0,51;-af,-4h;-ad,18;-39,ap;-2l,pg;-57,8b;-ir,7j;-bd,-5g;-tb,5c;1u,11p;-87,fg;8o,5r;-2o,fu;7m,c6;4y,lw;-6l,ha;-f6,7s;-2z,az;43,g1;-1h9,16;-ap,wc;84,h;-d,bz;-5f,84;-18,g2;-g5,89;-hh,-a;-bi,82;-is,5i;-ax,ae;-v4,4l;-u6,ow;28,im;-3f,ap;2z,kt;-10d,-4p;-en,-ag;-oa,-b9;-67,-8f;-eb,-l;-ko,2c;-fo,-4s;-cn,37;1v,167;-ms,-gd;-oj,p;-ai,eu;-ig,1m;5w,bx;-fg,gx;-bk,p0;7c,53;-1,bq;gs,81;-2s,f1;73,9o;21,cy;vs,ix;mr,5c;3q,47;p1,-1b;ci,246;o,c1;-4d,fx;-cc,a5;5,k6;fo,4l;5k,-2v;x,an;-ga,2v;-c,he;1i4,-n;97,9l;7q,-8t;5f,-ge;59,3f;fa,-ep;lm,1t;5d,8i;ko,6i;bg,4k;38,br;ju,7x;-1i,5u;-nj,2e;-3v,hi;15,im;-cg,77;57,2k;kl,-3j;m3,-6y;80,6k;k0,4b;v2,ae;a6,am;-3p,7u;eg,18;6h,-6e;-3m,-c7;9k,-47;6d,-cx;-7p,-9t;-4g,-nn;74,-e1;21,-cv;h3,-d1;dn,-1e;33,5g;8s,17;ck,4w;91,7e;fd,-2d;6s,10;f3,-2a;2i,5o;-4n,5j;2s,81;b7,-2g;d4,2u;fx,-5w;c5,-5q;8l,7j;68,-16;3t,-7u;da,20;ao,ak;8j,kg;gf,pf;9h,1b;6v,-fd;fl,-1ck;ev,-4m;r,-j6;-kw,-mv;8n,-8d;1d3,-4d;11,-rv;l3,i8;yy,-9z;1a5,-gz;dk,-ga;-4k,-fd;wb,8k;1i2,-ep;15i,13;153,-n0;zh,-v4;le,-80;nr,-15;a3,-8r;9f,-zd;4m,-gt;-b2,-19x;-e5,-i5;-136,-12o;-hp,-ve;-kk,-o3;-6y,-k;-7r,-kf;1z,-1g2;-7r,-16t;-2y,-ic;-8t,-ay;-4x,-115;-s6,-10a;-4q,-so;-mh,-c2;-6i,-gn;-u7,2;-17p,-ao;-jk,-cd;-v4,-84;-wp,-m4;-ni,-rk;-42,-kr;4m,-fc;-57,-s2;-6a,-dk;-jf,-fa;-uu,-1cw;-of,-m2;-iw,-cz;-co,-qg;-ie,-fv',
        ],
    ],
    [
        ['Uruguay', 'Uruguay', 'URY', null],
        0,
        [
            '-18gp,-nbc;i1,2y;rv,-lh;ab,t;sm,-ht;ls,-fc;g2,-ix;-c9,-d6;7p,-fq;-c0,-hh;-ve,-fg;-ki,5k;-f1,-2z;-pp,by;-iu,-x;-gx,fe;25,hy;61,66;-9,ro;7f,sk;6y,m9',
        ],
    ],
    [
        ['Ecuador', 'Ecuador', 'ECU', null],
        0,
        [
            '-1m5p,-48;3v,-l3;-8n,-i3;-ua,-t3;-xf,-ay;-h1,-o6;-59,-ir;-fp,-bf;-bo,e1;-b8,30;-bh,-28;-r,a7;7x,6m;-3b,bk;et,kr;-61,c5;-am,-cw;-gn,c6;5n,7u;-4p,p8;9r,46;54,hb;ai,hw;-1y,bc;f8,5z;j4,b2;rs,-fv;56,g;6s,-by;nl,-3v;7w,4f;dn,-97;bw,-6l',
        ],
    ],
    [
        ['Colombia', 'Colombia', 'COL', null],
        0,
        [
            '-1flo,yt;-59,-3f;-5f,ge;-7q,8t;-97,-9l;-1i4,n;c,-he;ga,-2v;-x,-an;-5k,2v;-fo,-4l;-5,-k6;cc,-a5;4d,-fx;-o,-c1;-ci,-246;-dw,er;-8b,o;hx,sa;-l9,d0;-gp,-2e;-a1,4t;-fb,-7c;-ko,3h;-ge,t5;-cu,75;-8w,d4;-ih,d6;-7e,-2n;-bw,6l;-dn,97;-7w,-4f;-nl,3v;-6s,by;-56,-g;-rs,fv;-3s,8m;ad,23;-18,dx;6i,a3;ds,1v;bq,hg;am,el;-a8,6m;58,g4;-69,pf;5y,7a;-4e,ni;-b9,et;3l,di;8y,-20;58,89;-6g,gd;3e,43;ec,-w;kv,je;bf,2y;a,97;55,nh;fx,cw;hi,j;28,5s;lq,-2b;lv,e1;au,68;dg,dd;9u,-1p;7b,-7b;-5f,-9d;-hu,-4n;-72,-dw;-ar,-7z;-82,-ac;-3f,-jt;-7p,-g9;ec,-1v;3l,-cs;64,-64;27,-b6;-3b,-aa;10,-5t;6u,-2c;6m,-9o;zq,2o;g5,-3k;jk,-nw;b8,2z;k0,-1i;fu,36;9u,-4s;-51,-ey;-67,-9c;-26,-jx;5l,-ih;7w,-89;z,-68;-e3,-dt;a3,-65;7e,-9p;8h,-rq',
        ],
    ],
    [
        ['Paraguay', 'Paraguay', 'PRY', null],
        0,
        [
            '-18vq,-fkh;87,-fg;-1u,-11p;tb,-5c;bd,5g;ir,-7j;57,-8b;2l,-pg;39,-ap;ad,-18;af,4h;a0,-51;0,-fa;-3s,-gf;-5g,-g1;-4k,-oj;-p7,-la;-lz,-4g;-v7,48;-s0,7k;rc,168;-3z,ca;-sm,av;-xy,ki;-mq,48;-1f2,19c;ay,x9;p,ey;dc,og;1ce,83;pt,-e;pw,-e7;h,-8l',
        ],
    ],
    [
        ['Venezuela', 'Venezuela', 'VEN', null],
        0,
        [
            '-1av2,40g;3p,-7u;-a6,-am;-v2,-ae;-k0,-4b;-80,-6k;-m3,6y;-kl,3j;-57,-2k;cg,-77;-15,-im;3v,-hi;nj,-2e;1i,-5u;-ju,-7x;-38,-br;-bg,-4k;-ko,-6i;-5d,-8i;-lm,-1t;-fa,ep;-8h,rq;-7e,9p;-a3,65;e3,dt;-z,68;-7w,89;-5l,ih;26,jx;67,9c;51,ey;-9u,4s;-fu,-36;-k0,1i;-b8,-2z;-jk,nw;-g5,3k;-zq,-2o;-6m,9o;-6u,2c;-10,5t;3b,aa;-27,b6;-64,64;-3l,cs;-ec,1v;7p,g9;3f,jt;82,ac;ar,7z;72,dw;hu,4n;-s,-6k;-gb,-39;92,-cm;-c,-ej;-c9,-g4;ai,-m2;bz,1t;69,k3;-8m,9s;-1f,l1;ym,ba;-3v,d4;9r,8r;9z,-ji;jh,-h;i2,-fh;13,-97;oy,-9;to,2v;fx,-cg;l9,-3g;fl,8p;b,6z;yf,1p;xa,e;-nl,-88;9h,-d4;m8,-23;l2,-do;4g,-m9;eh,n;aw,-6k;-m1,-gb;-2f,-a5;9i,-ab;-6w,-57;-h3,-4h;k,-cu;-7j,-7n;is,-l3',
        ],
    ],
    [
        ['Falkland Is.', 'Falkland Islands', 'FLK', null],
        0,
        [
            '-1b80,-140a;xc,go;nm,-6y;go,b4;m8,-ci;-8c,-9q;-11i,-8c;-ci,9q;-nm,-ci;-dw,ci',
        ],
    ],
    [
        ['Ethiopia', 'Ethiopia', 'ETH', null],
        0,
        [
            '10vh,66b;-26h,-2bd;-107,-18;-or,-jl;-ht,-j;-7m,-8r;-iz,0;-b8,9e;-pd,-bm;-88,-bl;-ii,27;-66,37;-6i,-r;-8s,a;-z6,nl;-jc,0;-9i,95;0,fl;-ef,4o;-gf,u8;-cp,6g;-4v,b4;-e3,dj;-h2,20;9h,fu;er,o;45,8i;-d,oz;87,t2;d6,7s;2t,bd;bw,l8;gs,dr;ba,rd;4g,nv;wc,-5t;8o,kq;gv,-cm;ga,6k;6q,-5t;j1,-c;o7,-b5;76,-9m;cc,-8x;bf,-ga;9i,-90;-9s,-ca;-9e,-d1;26,-7o;g,-8g;fi,-h;6p,1z;66,-4y;-62,-9u;a9,-fb;a9,-de;am,-9w;2it,-wz;nd,6',
        ],
    ],
    [
        ['S. Sudan', 'South Sudan', 'SSD', null],
        0,
        [
            'nsi,2ph;-og,ih;-6m,bv;-fh,-5w;-cu,1u;-7g,-4o;-ch,3d;-gu,my;-4h,8t;-kr,b0;-71,go;-bk,c0;-ip,eh;-9,91;-f8,b8;-iw,av;8j,31;9j,59;76,os;7n,cw;k1,3t;4r,-7n;eb,-g7;7n,-2e;a1,4s;k1,-z;3t,-5q;ro,0;y,5q;eb,59;2v,84;ai,5q;nd,-g8;eb,2v;du,k1;f9,fa;-2e,go;-6o,84;gp,1g;1w,67;cw,-1x;-3c,-ki;3c,-k1;eb,-az;3c,-9j;-h,-du;3u,-k;c,-ln;-45,-8i;-er,-o;-9h,-fu;h2,-20;e3,-dj;4v,-b4;cp,-6g;gf,-u8;-iu,-ib;-h3,-gl;-h3,-cs;-jk,2;-md,-6i;-hn,68;-bg,-7l',
        ],
    ],
    [
        ['Somalia', 'Somalia', 'SOM', null],
        0,
        [
            'w35,-1ar;-gg,mx;-c,2t7;oa,vi;7m,8r;ht,j;or,jl;107,18;26h,2bd;je,n7;cj,h2;0,ei;0,s0;4,bg;6,h;0,0;8w,j;ct,45;eq,2t;d5,9i;aj,3;n,-7p;-2k,-g5;3,-em;-5v,-a1;-7u,-u1;-dd,-v1;-h6,-zh;-nu,-14q;-nq,-v4;-wo,-11w;-rt,-mh;-15k,-rl;-pw,-l5;-ue,-xn;-6f,-en;-6a,-6l',
        ],
    ],
    [
        ['Kenya', 'Kenya', 'KEN', null],
        0,
        [
            'u8y,-3lx;-13v,rs;-1w,g4;-2sq,1kl;-4p,32;-a,tg;7y,b9;do,ie;a4,k9;-c8,vw;-39,dy;-d6,ja;h3,gl;iu,ib;ef,-4o;0,-fl;9i,-95;jc,0;z6,-nl;8s,-a;6i,r;66,-37;ii,-27;88,bl;pd,bm;b8,-9e;iz,0;-oa,-vi;c,-2t7;gg,-mx;-jg,-b4;-6v,-bl;-af,-21;-3y,-jl;-8x,-b7;-5f,-ii;-b7,-96',
        ],
    ],
    [
        ['Malawi', 'Malawi', 'MWI', null],
        0,
        [
            'p9z,-74f;r9,-56;5l,-7p;9f,-cy;7s,-11s;-7s,-l4;7s,-104;9n,f;a1,-8z;bn,-k3;2d,-zq;-c1,-5u;-8h,-ja;-i5,h5;-22,jl;5v,cx;-1m,b5;-az,71;-7n,-2k;-g0,dc;-em,77;8g,pt;8q,9o;-5c,n1;5l,mi;4r,7j;-73,nl;-d4,ce',
        ],
    ],
    [
        ['Tanzania', 'United Republic of Tanzania', 'TZA', null],
        0,
        [
            'q5s,-qe;4p,-32;2sq,-1kl;1w,-g4;13v,-rs;-ct,-y8;1n,-fr;hs,-a4;u,-78;-7n,-gs;1l,-8g;-1t,-da;9p,-he;bi,-re;a7,-63;0,0;-m4,-g4;-ud,-as;-go,g;-9x,-8c;-jc,-q;-79,-3i;-xe,7u;-kw,-29;-7s,11s;-9f,cy;-5l,7p;-r9,56;-fr,8d;-ho,4o;-b2,4n;-bm,73;0,0;-f0,z0;-g4,fk;-5k,g4;2s,eg;-50,pk;bi,1c;a2,a2;au,eh;6u,5u;-9,91;-5z,6a;-1m,ay;0,0;80,3j;1m,gc;-b1,fo;9r,3c;ug,-c;1km,25',
        ],
    ],
    [
        ['Somaliland', 'Somaliland', '-99', null],
        0,
        [
            '11ro,8sz;0,0;-6,-h;-4,-bg;0,-s0;0,-ei;-cj,-h2;-je,-n7;-nd,-6;-2it,wz;-am,9w;-a9,de;-a9,fb;62,9u;a8,ev;92,-54;5g,-bi;cj,-bm;ds,-4;q7,74;u8,3b;oh,8m;ds,1u;9x,52;ft,10;0,0',
        ],
    ],
    [
        ['Morocco', 'Morocco', 'MAR', null],
        0,
        [
            '-1oa,r4w;ah,-hs;1o,-gw;9l,-tc;7b,-5w;-53,-at;-10d,-4p;-ck,-aa;-g2,-2f;-17,-kk;-wi,-b0;-am,-dx;-mr,-7g;-rq,-49;-18v,-ki;8,-wx;-48,0;n,-ev;-h6,-x;-8y,-6b;-cm,0;-a2,3m;-ne,-30;-91,-ln;-8p,-21;-d2,-z1;-12m,-tz;-96,-12d;-be,-ch;-3c,-a0;-1qk,-28;-h,1;1b,cw;ao,7k;93,eh;-1s,9f;9j,jl;fh,ho;9d,4h;7c,g8;o,es;a1,h6;ii,a5;hm,sd;i,e;dz,ao;pu,33;lw,iz;dx,7f;n7,n7;-6y,yk;ak,nw;3q,en;hw,ir;rv,cp;kl,bh;il,ss;8q,h2;kg,-5;gr,-bs;qf,1x;ss,-65;c2,-b',
        ],
    ],
    [
        ['W. Sahara', 'Western Sahara', 'ESH', null],
        0,
        [
            '-6oq,lc8;1,-1v;-j,-5d;-3,-163;-2j6,1g;w,-1z2;-q1,-2i;-6t,-ea;5a,-144;-30s,6;-62,-99;17,bq;h,-1;1qk,28;3c,a0;be,ch;96,12d;12m,tz;d2,z1;8p,21;91,ln;ne,30;a2,-3m;cm,0;8y,6b;h6,x;-n,ev;48,0',
        ],
    ],
    [
        ['Congo', 'Republic of the Congo', 'COG', null],
        0,
        [
            'e8l,2pc;-1n,-gs;-8c,-eu;-5f,-hc;-3h,-om;1h,-fr;-4j,-9n;-p,-a7;-37,-8v;-ib,-de;-cq,-eb;-c2,-qz;x,-mv;-70,-8w;-g7,-dl;-gc,-he;-ae,4x;-1s,7v;-f5,a;-9i,-an;-7a,2u;-af,9j;-8e,-4o;-b8,-c0;-mt,tf;l5,fc;-ah,id;9j,70;ir,3e;27,cb;ev,-dc;oi,-16;8j,d5;3i,ih;-31,lo;-d5,gg;c1,w6;-6x,5j;-ko,-2a;-7s,ed;21,c4;z2,-13;mg,-7c;m3,-6k;20,f0;ek,pu;gk,eq;it,-4o;hv,-1k',
        ],
    ],
    [
        ['Dem. Rep. Congo', 'Democratic Republic of the Congo', 'COD', null],
        0,
        [
            'mn0,-3h0;50,-pk;-2s,-eg;5k,-g4;g4,-fk;f0,-z0;0,0;-ay,2u;-11b,-4p;-7g,-3c;-7x,-hq;68,-c9;-4y,-ww;-3g,-rw;7i,-4y;jg,-at;7m,52;2c,-ty;-la,8;-be,fa;-a9,bv;-la,3v;-69,ek;-gz,-8r;-m9,3v;-9a,cm;-hn,2k;-d0,-o;-1m,8n;-9l,p;-cn,1n;-h8,-46;-c2,p;-6w,-2k;1i,x2;-9a,ab;-21,h3;43,gr;-5n,aq;-i,hh;-xp,-9;2f,a1;-e6,-4;-1i,-4t;-h8,-13;-6z,-g7;-46,-6y;-fd,3x;-96,-3x;-id,-29;-an,ej;-6e,90;-7z,gn;-6u,kq;-29z,d;-9r,-3c;-82,i;-bh,-3q;-3w,8m;73,2y;v,c4;4k,75;a4,5u;7a,-2u;9i,an;f5,-a;1s,-7v;ae,-4x;gc,he;g7,dl;70,8w;-x,mv;c2,qz;cq,eb;ib,de;37,8v;p,a7;4j,9n;-1h,fr;3h,om;5f,hc;8c,eu;1n,gs;2i,je;at,e4;ew,8y;mv,-9g;hp,-a9;kb,-2r;kq,-5f;8b,gs;3t,25;co,-2s;uy,dv;ay,-5w;90,u;46,6r;ab,2e;kx,-2x;ht,-n;96,2y;gu,-my;ch,-3d;7g,4o;cu,-1u;fh,5w;6m,-bv;og,-ih;0,0;-1p,-wh;b5,-3s;-8x,-9v;-ao,-7d;-an,-ei;-5u,-cx;-1k,-ma;-6g,-am;-9,-ky;-7z,-7r;-11,-gj;-3u,-25;-2k,-f7;6z,-cn;1s,-xi',
        ],
    ],
    [
        ['Namibia', 'Namibia', 'NAM', null],
        0,
        [
            'fco,-j40;-1,-2ul;-ot,-e7;-ex,-21;-hh,59;-ch,20;-4o,bw;-az,7m;-db,-dr;-kn,l0;-aw,ka;-64,r2;-6v,k4;-9b,16s;-m,x8;-3k,f6;-at,bg;-ed,my;-el,xc;-62,hg;-mm,r4;-1p,lb;dd,5a;gn,4r;i0,-u;gl,-ck;47,1y;34l,17;j9,-db;1v9,-3y;1f2,bc;mr,6b;i0,-1l;az,-6a;7,-2b;-fn,-69;-8g,-2;-hq,-aw;-am,bg;-16u,-9q;-ko,-x;-u,-2qy;-re,-z;1,-293',
        ],
    ],
    [
        ['South Africa', 'South Africa', 'ZAF', null],
        0,
        [
            'cm1,-m1t;db,dr;az,-7m;4o,-bw;ch,-20;hh,-59;ex,21;ot,e7;1,2ul;7i,-46;gh,-qe;-2l,-gx;68,-9s;jw,2u;dw,cf;d6,8d;6s,db;dk,6f;bq,-3d;d9,-7s;mm,-1e;hs,6h;2t,8o;4w,db;f4,28;8c,af;99,ij;oy,kq;13b,kh;bb,-b;dg,-4q;9d,3c;er,-2s;db,-133;79,-jq;-4z,-uz;2e,-9z;-e1,53;-81,-1z;-2m,-84;-7l,-af;9,-9m;gl,-f2;g9,30;5o,cc;l2,-8;-6y,-k8;-3a,-n3;-77,-cj;-iy,-e1;-5f,-41;-bs,-e4;-7r,-ea;-fr,-jw;-ve,-so;-jm,-go;-kz,-cn;-t2,-as;-e5,-1g;-3l,-7q;-gw,44;-dr,-5a;-u4,5d;-gu,-3e;-bi,1g;-sn,-az;-nq,-4e;-h6,-ai;-cn,-o;-br,9w;-9e,j;-by,ce;-1c,-3v;-3p,7h;6,gb;-91,im;8z,52;-q,lb;-i7,q0;-dz,nj;-1,3;-jy,103',
            'mcy,-mcc;-c4,8k;-d0,-5n;-f1,-aw;-eu,-hl;ku,-ld;9y,2r;54,8w;fh,4c;4q,92;8j,dj;-9n,8d',
        ],
    ],
    [
        ['Libya', 'Libya', 'LBY', null],
        0,
        [
            'jag,gz4;0,-1jh;-vy,-3;-c,-bo;-32t,1h7;-32s,1h7;-s2,-f7;-jn,-ac;-fn,fa;-17x,bz;-c7,he;-ly,cx;-cz,-54;-9w,fi;-11,bw;-gg,k9;b1,bm;-2f,hh;3j,f7;-20,co;4w,mo;-1i,cx;-90,oj;dk,6f;2f,br;-2z,bi;j3,ap;8k,8x;dj,7z;1l,lc;wm,-9k;bo,2e;n8,-4n;10v,-cf;d0,-op;oy,-5e;135,-bm;tl,-du;dk,78;db,cs;-6h,la;8q,di;k1,d1;j4,3s;11l,-5o;9h,-cg;ac,-4;8v,-4q;rl,-3a;6s,-96;-a2,-dc;4b,-bv;-76,-h6;8c,-md;0,-2qt;0,-2ua',
        ],
    ],
    [
        ['Tunisia', 'Tunisia', 'TUN', null],
        0,
        [
            '7be,ndw;-bu,1dv;-h5,b7;-9,6q;-mp,gk;-2h,kx;h5,fi;6j,mx;-4e,qh;5n,e9;u9,b8;jg,-3c;-t,-e2;nk,a8;1z,-5c;-dw,-dm;-7,-cv;9n,-6w;-3o,-o1;-ia,-dz;5a,-f5;ed,-h;70,-d8;ak,-4c;-1l,-lc;-dj,-7z;-8k,-8x;-j3,-ap;2z,-bi;-2f,-br;-dk,-6f',
        ],
    ],
    [
        ['Zambia', 'Zambia', 'ZMB', null],
        0,
        [
            'npw,-6fo;bm,-73;b2,-4n;ho,-4o;fr,-8d;d4,-ce;73,-nl;-4r,-7j;-5l,-mi;5c,-n1;-8q,-9o;-8g,-pt;em,-77;-2cb,-mw;2n,-js;-l1,-3t;-fu,-b2;-3d,-9n;-9y,-26;-o6,-mv;-fe,-hz;-9d,-n;-91,37;-v2,31;-50,23;-7,2b;-az,6a;-i0,1l;-mr,-6b;-i5,hd;-iq,mq;1a,2ge;1lu,-d;-2d,9l;45,af;-4w,d1;36,dh;-2y,8m;9l,-p;1m,-8n;d0,o;hn,-2k;9a,-cm;m9,-3v;gz,8r;69,-ek;la,-3v;a9,-bv;be,-fa;la,-8;-2c,ty;-7m,-52;-jg,at;-7i,4y;3g,rw;4y,ww;-68,c9;7x,hq;7g,3c;11b,4p;ay,-2u',
        ],
    ],
    [
        ['Sierra Leone', 'Sierra Leone', 'SLE', null],
        0,
        [
            '-a7z,6vb;ev,c8;37,7p;4r,60;7o,n;6h,58;m8,-1;7q,-9y;61,-bo;-x,-83;4h,-79;-b,-a7;7n,1l;-cy,-cz;-cj,-f2;-1h,-83;-6n,-8w;-7h,22;-k0,b7;-eh,ew;-4v,a5;-3f,kj',
        ],
    ],
    [
        ['Guinea', 'Guinea', 'GIN', null],
        0,
        [
            '-akk,9pm;de,-a;jz,-6s;64,m;23,34;f6,-27;40,1k;1m,-a6;4e,1;79,3p;4m,-x;7q,-72;bw,-28;7m,60;8z,3q;6o,3w;5l,-q;66,-64;3b,-7n;be,-bn;-5p,-76;-13,-91;5x,2q;3h,-38;-1h,-8a;8h,-80;-5j,-26;-29,-9f;6f,-bi;6v,-m8;-ab,-3d;-2o,-3v;25,-5d;-1n,-c4;-4e,-1;-7v,q;-5o,-b7;-7v,5;-5e,5x;1u,b6;-bm,h0;-7a,-34;-5x,-n;-7n,-1l;b,a7;-4h,79;x,83;-61,bo;-7q,9y;-m8,1;-6h,-58;-7o,-n;-4r,-60;-37,-7p;-ev,-c8;-c6,gg;-at,av;-74,3m;-6y,5i;-35,ca;-43,65;-82,4j;cc,dk;8g,-j;79,4o;64,2;4e,3o;-2d,98;31,2w;j,9f',
        ],
    ],
    [
        ['Liberia', 'Liberia', 'LBR', null],
        0,
        [
            '-6if,5xi;-1a,-83;2s,-df;-62,-cc;84,-7n;8t,-1v;bs,-bn;u,-ay;-2n,-3h;-25,-mv;-7a,-9;-sn,d8;-p8,l6;-no,f7;-iq,hx;6n,8w;1h,83;cj,f2;cy,cz;5x,n;7a,34;bm,-h0;-1u,-b6;5e,-5x;7v,-5;5o,b7;7v,-q',
        ],
    ],
    [
        ['Central African Rep.', 'Central African Republic', 'CAF', null],
        0,
        [
            'l4e,41e;-96,-2y;-ht,n;-kx,2x;-ab,-2e;-46,-6r;-90,-u;-ay,5w;-uy,-dv;-co,2s;-3t,-25;-8b,-gs;-kq,5f;-kb,2r;-hp,a9;-mv,9g;-ew,-8y;-at,-e4;-2i,-je;-hv,1k;-it,4o;-gk,-eq;-ek,-pu;-2y,81;-18,cp;-cq,8x;-a9,ec;-2d,9z;-d5,ej;29,8a;-2s,bp;26,lj;6o,51;dy,s6;mz,23;55,75;4l,-j;6y,-6b;yz,an;bt,au;eh,9q;-2r,9s;7u,2k;qu,-1q;q5,cv;k3,ub;e3,b9;hl,4q;36,-bw;g0,-hd;3,-bc;-4i,-bk;1s,-8n;9n,-80;l5,-c5;f8,-b8;9,-91;ip,-eh;bk,-c0;71,-go;kr,-b0;4h,-8t',
        ],
    ],
    [
        ['Sudan', 'Sudan', 'SDN', null],
        0,
        [
            'iyf,6cl;-l5,c5;-9n,80;-1s,8n;4i,bk;-3,bc;-g0,hd;-36,bw;c,6r;-a7,86;-b,g5;-5u,aq;-9r,-1m;2t,a7;77,bl;-36,bi;95,8j;-5s,6i;7c,h5;cp,kh;ny,-1y;-1d,329;c,bo;vy,3;0,1jh;33o,0;2zs,0;326,0;8z,-r9;-64,-52;42,-sl;a7,-x6;al,-6u;f7,-aa;-e2,-fu;-kh,-4l;-8q,-8i;-2r,-ih;-bz,-14u;2z,-b4;-4g,-nv;-ba,-rd;-gs,-dr;-bw,-l8;-2t,-bd;-d6,-7s;-87,-t2;d,-oz;-c,ln;-3u,k;h,du;-3c,9j;-eb,az;-3c,k1;3c,ki;-cw,1x;-1w,-67;-gp,-1g;6o,-84;2e,-go;-f9,-fa;-du,-k1;-eb,-2v;-nd,g8;-ai,-5q;-2v,-84;-eb,-59;-y,-5q;-ro,0;-3t,5q;-k1,z;-a1,-4s;-7n,2e;-eb,g7;-4r,7n;-k1,-3t;-7n,-cw;-76,-os;-9j,-59;-8j,-31;iw,-av',
        ],
    ],
    [
        ['Djibouti', 'Djibouti', 'DJI', null],
        0,
        [
            'wog,9oe;bw,-2f;8d,6t;6l,-8m;-w,-bj;-fu,-6n;bx,-7m;-a8,-ev;-66,4y;-6p,-1z;-fi,h;-g,8g;-26,7o;9e,d1;9s,ca',
        ],
    ],
    [
        ['Eritrea', 'Eritrea', 'ERI', null],
        0,
        [
            's3y,b4m;-2z,b4;bz,14u;2r,ih;8q,8i;kh,4l;e2,fu;g5,-w5;7n,-pi;f8,-dj;11x,-q9;fg,-fu;f2,-g1;8p,-9k;dn,-8c;-8d,-6t;-bw,2f;-9i,90;-bf,ga;-cc,8x;-76,9m;-o7,b5;-j1,c;-6q,5t;-ga,-6k;-gv,cm;-8o,-kq;-wc,5t',
        ],
    ],
    [
        ["Côte d'Ivoire", 'Ivory Coast', 'CIV', null],
        0,
        [
            '-672,7vj;3m,2i;7p,-46;lg,-8;55,84;4s,-k;81,35;4b,-bw;6h,3j;bh,44;ch,-62;4v,-97;ci,-5v;9q,6z;d0,12;j1,-76;7d,-13i;-bq,-nc;-78,-ve;c1,-nx;-19,-az;-cn,-a;-je,5g;-ht,-c;-ww,-4u;-jb,-81;-ri,-a7;-5d,r;25,mv;2n,3h;-u,ay;-bs,bn;-8t,1v;-84,7n;62,cc;-2s,df;1a,83;4e,1;1n,c4;-25,5d;2o,3v;ab,3d;-6v,m8;-6f,bi;29,9f;5j,26',
        ],
    ],
    [
        ['Mali', 'Mali', 'MLI', null],
        0,
        [
            '-8vu,9ln;1a,8o;-2d,aq;-af,7t;-5h,fx;-1a,ha;9d,52;4o,gd;8t,n;je,-7q;fo,5h;ar,-1u;46,66;33g,g;67,jg;-4u,3f;-de,3bw;-df,3bw;16j,i;2lp,-1om;2lp,-1om;6m,-d1;hb,-7y;cv,-4i;b,-hp;ut,2q;3,-1rz;-f7,-ik;-2d,-h4;-oo,-4e;-11w,-2e;-aa,-9w;-ht,-13;-ht,-5;-6y,5c;-fa,-3y;-pz,-bj;-5b,-8p;-lk,-cg;-3s,-75;-bn,-5n;-df,3q;-7m,-6s;-43,-j1;-m2,-n1;n,-9f;-7l,-bs;1v,-g4;-bh,-44;-6h,-3j;-4b,bw;-81,-35;-4s,k;-55,-84;-lg,8;-7p,46;-3m,-2i;-8h,80;1h,8a;-3h,38;-5x,-2q;13,91;5p,76;-be,bn;-3b,7n;-66,64;-5l,q;-6o,-3w;-8z,-3q;-7m,-60;-bw,28;-7q,72;-4m,x;-79,-3p;-4e,-1;-1m,a6',
        ],
    ],
    [
        ['Senegal', 'Senegal', 'SEN', null],
        0,
        [
            '-cwa,ahn;-bg,ln;-dv,9w;c8,59;dg,jj;6m,e9;9i,8x;dt,-2f;dk,62;fj,b;d9,-86;ig,-7d;gt,-kf;ic,-j3;1a,-ha;5h,-fx;af,-7t;2d,-aq;-1a,-8o;-40,-1k;-f6,27;-23,-34;-64,-m;-jz,6s;-de,a;-1fc,16;-7h,-34;-97,w;-ep,-4j;-4l,la;pb,-l;6o,3w;4z,9;ab,6f;bx,-5w;c2,-h;c1,68;-5m,81;-96,-4o;-8m,4;-az,6u;-8t,-g;-6a,-6k;-u9,-t',
        ],
    ],
    [
        ['Nigeria', 'Nigeria', 'NGA', null],
        0,
        [
            '22s,4tv;1l,18s;-p,ho;58,hj;8k,8i;dh,h7;-2x,7h;5h,b7;-69,gh;13,98;1y,ot;7y,b7;3x,fz;78,60;tv,3b;ru,-ad;af,-ai;e7,-h;d6,6u;xm,-ed;e6,o;ge,bu;ga,-u;81,3w;ey,-1m;li,-84;lq,fj;6j,-14;is,-ue;56,m;b0,-b3;-31,-50;-1h,-99;-ne,-lh;-7c,-hr;-3x,-ef;-5x,-67;-5l,-jg;-ev,-bg;-4b,-e2;-69,-b7;-2l,-bk;-j3,-9d;-fm,bf;-aj,-g;-gj,-ga;-82,-9;-d7,-qs;-76,-jo;-su,-a0;-aj,1h;-ap,-68;-m8,l;-ev,he;-95,k4;-jo,ib;-kw,-d;-oi,1',
        ],
    ],
    [
        ['Benin', 'Benin', 'BEN', null],
        0,
        [
            '22s,4tv;-mz,-39;-6u,j6;19,1rt;-5l,5q;-12,dm;-9n,9r;-8i,87;3k,em;9j,36;5o,c5;dl,2l;62,8b;9c,85;9z,3;l6,-g0;-13,-98;69,-gh;-5h,-b7;2x,-7h;-dh,-h7;-8k,-8i;-58,-hj;p,-ho;-1l,-18s',
        ],
    ],
    [
        ['Angola', 'Angola', 'AGO', null],
        1,
        [
            [
                'a10,-3ot;-a4,-5u;-4k,-75;-v,-c4;-73,-2y;-7f,kw;b8,c0;8e,4o;af,-9j',
            ],
            [
                '9ia,-4pg;bh,3q;82,-i;9r,3c;29z,-d;6u,-kq;7z,-gn;6e,-90;an,-ej;id,29;96,3x;fd,-3x;46,6y;6z,g7;h8,13;1i,4t;e6,4;-2f,-a1;xp,9;i,-hh;5n,-aq;-43,-gr;21,-h3;9a,-ab;-1i,-x2;6w,2k;c2,-p;h8,46;cn,-1n;2y,-8m;-36,-dh;4w,-d1;-45,-af;2d,-9l;-1lu,d;-1a,-2ge;iq,-mq;i5,-hd;-1f2,-bc;-1v9,3y;-j9,db;-34l,-17;-47,-1y;-gl,ck;-i0,u;-gn,-4r;-dd,-5a;-2m,hh;3v,of;9l,pg;1g,bx;90,p1;6m,be;fz,i6;8x,cd;2x,kl;-1h,fr;-8b,9x;-7e,gv;-6u,go;1i,5s;8j,b0;-8f,qu;-5p,im;-dx,hl;2n,5e',
            ],
        ],
    ],
    [
        ['Botswana', 'Botswana', 'BWA', null],
        0,
        [
            'mpk,-h1n;-13b,-kh;-oy,-kq;-99,-ij;-8c,-af;-f4,-28;-4w,-db;-2t,-8o;-hs,-6h;-mm,1e;-d9,7s;-bq,3d;-dk,-6f;-6s,-db;-d6,-8d;-dw,-cf;-jw,-2u;-68,9s;2l,gx;-gh,qe;-7i,46;-1,293;re,z;u,2qy;ko,x;16u,9q;am,-bg;hq,aw;8g,2;fn,69;50,-23;ap,-m7;5l,-4y;8r,-g3;vg,-uj;bw,-2z;2,-9t;86,-hm;li,-49;hp,-ck',
        ],
    ],
    [
        ['Zimbabwe', 'Zimbabwe', 'ZWE', null],
        0,
        [
            'o2f,-h64;-er,2s;-9d,-3c;-dg,4q;-bb,b;-hp,ck;-li,49;-86,hm;-2,9t;-bw,2z;-vg,uj;-8r,g3;-5l,4y;-ap,m7;v2,-31;91,-37;9d,n;fe,hz;o6,mv;9y,26;3d,9n;fu,b2;l1,3t;1t,-ad;n6,k;cv,-5v;60,-6v;d8,-21;eg,-8x;2,-z6;-5f,-j9;-17,-kr;4h,-89;-35,-gc;-47,-2j;-7c,-k1;-ta,-vk',
        ],
    ],
    [
        ['Chad', 'Chad', 'TCD', null],
        0,
        [
            'ie6,f3w;1d,-329;-ny,1y;-cp,-kh;-7c,-h5;5s,-6i;-95,-8j;36,-bi;-77,-bl;-2t,-a7;9r,1m;5u,-aq;b,-g5;a7,-86;-c,-6r;-hl,-4q;-e3,-b9;-k3,-ub;-q5,-cv;-qu,1q;-7u,-2k;2r,-9s;-eh,-9q;-bt,-au;-yz,-an;-6y,6b;-4l,j;-55,-75;-mz,-23;4d,7j;-8r,j5;-3x,bi;-c4,4q;-ge,g7;61,d4;co,-2s;7u,1z;fj,-a;-f4,p9;10,ih;-1v,if;-b1,hs;2s,d3;-hu,n;3,hw;-bl,aa;c0,10l;zg,q7;1g,105;aq,1kd;61,bz;-bk,9i;-g,8u;-ae,79;-6u,176;s2,f7;32s,-1h7;32t,-1h7',
        ],
    ],
    [
        ['Algeria', 'Algeria', 'DZA', null],
        0,
        [
            '-6p8,l50;j,5d;-1,1v;-8,wx;18v,ki;rq,49;mr,7g;am,dx;wi,b0;17,kk;g2,2f;ck,aa;10d,4p;53,at;-7b,5w;-9l,tc;-1o,gw;-ah,hs;qp,f7;u2,4u;hj,bg;qr,8h;1b3,4y;19y,29;e0,-44;q6,ay;to,7;bb,-6g;j0,1o;-5n,-e9;4e,-qh;-6j,-mx;-h5,-fi;2h,-kx;mp,-gk;9,-6q;h5,-b7;bu,-1dv;90,-oj;1i,-cx;-4w,-mo;20,-co;-3j,-f7;2f,-hh;-b1,-bm;gg,-k9;11,-bw;9w,-fi;cz,54;ly,-cx;c7,-he;-2n7,-1gy;-28f,-1il;-137,-ce;-ut,-2q;-b,hp;-cv,4i;-hb,7y;-6m,d1;-2lp,1om;-2lp,1om;-2wh,1v9',
        ],
    ],
    [
        ['Mozambique', 'Mozambique', 'MOZ', null],
        0,
        [
            'qo0,-8w0;kw,29;xe,-7u;79,3i;jc,q;9x,8c;go,-g;ud,as;m4,g4;0,0;0,0;4h,-cg;-15,-rp;3g,-od;13,-17f;4v,-dm;-8a,-ju;-as,-jb;-ho,-h8;-pf,-ak;-vb,-dh;-ve,-tu;-ap,-52;-je,-jr;-bg,-6f;-2c,-jt;d6,-l1;5h,-gb;d,-8b;4x,1e;-t,-r9;-4i,-cw;6j,-4s;-44,-bk;-bm,-9v;-mx,-9e;-xf,-f2;-c6,-a9;2d,-bq;74,-1v;-2e,-em;-l2,8;-2e,ca;-44,ch;-2e,9z;4z,uz;-79,jq;-db,133;ta,vk;7c,k1;47,2j;35,gc;-4h,89;17,kr;5f,j9;-2,z6;-eg,8x;-d8,21;-60,6v;-cv,5v;-n6,-k;-1t,ad;-2n,js;2cb,mw;g0,-dc;7n,2k;az,-71;1m,-b5;-5v,-cx;22,-jl;i5,-h5;8h,ja;c1,5u;-2d,zq;-bn,k3;-a1,8z;-9n,-f;-7s,104;7s,l4',
        ],
    ],
    [
        ['eSwatini', 'eSwatini', 'SWZ', null],
        0,
        [
            'oqw,-kmm;-5o,-cc;-g9,-30;-gl,f2;-9,9m;7l,af;2m,84;81,1z;e1,-53;44,-ch;2e,-ca',
        ],
    ],
    [
        ['Burundi', 'Burundi', 'BDI', null],
        0,
        [
            'nie,-1v2;1m,-ay;5z,-6a;9,-91;-6u,-5u;-au,-eh;-a2,-a2;-bi,-1c;-1s,xi;-6z,cn;gv,-27;8i,fu;es,-1u',
        ],
    ],
    [
        ['Rwanda', 'Rwanda', 'RWA', null],
        0,
        [
            'ngz,-vj;b1,-fo;-1m,-gc;-80,-3j;0,0;-es,1u;-8i,-fu;-gv,27;2k,f7;3u,25;11,gj;7z,7r;6r,-2u;gl,8k',
        ],
    ],
    [
        ['Uganda', 'Uganda', 'UGA', null],
        0,
        [
            'q5s,-qe;-1km,-25;-ug,c;-9r,-3c;-gl,-8k;-6r,2u;9,ky;6g,am;1k,ma;5u,cx;an,ei;ao,7d;8x,9v;-b5,3s;1p,wh;0,0;bg,7l;hn,-68;md,6i;jk,-2;h3,cs;d6,-ja;39,-dy;c8,-vw;-a4,-k9;-do,-ie;-7y,-b9;a,-tg',
        ],
    ],
    [
        ['Lesotho', 'Lesotho', 'LSO', null],
        0,
        [
            'mcy,-mcc;9n,-8d;-8j,-dj;-4q,-92;-fh,-4c;-54,-8w;-9y,-2r;-ku,ld;eu,hl;f1,aw;d0,5n;c4,-8k',
        ],
    ],
    [
        ['Cameroon', 'Cameroon', 'CMR', null],
        0,
        [
            'b6o,9x7;b1,-hs;1v,-if;-10,-ih;f4,-p9;-fj,a;-7u,-1z;-co,2s;-61,-d4;ge,-g7;c4,-4q;3x,-bi;8r,-j5;-4d,-7j;-dy,-s6;-6o,-51;-26,-lj;2s,-bp;-29,-8a;d5,-ej;2d,-9z;a9,-ec;cq,-8x;18,-cp;2y,-81;-20,-f0;-m3,6k;-mg,7c;-z2,13;-3h,1j;-gg,-3l;-gv,3q;-d8,-1u;-197,n;42,lx;-av,ie;-co,4p;-5n,cg;-74,40;b,7o;76,jo;d7,qs;82,9;gj,ga;aj,g;fm,-bf;j3,9d;2l,bk;69,b7;4b,e2;ev,bg;5l,jg;5x,67;3x,ef;7c,hr;ne,lh;1h,99;31,50;-b0,b3;x,8u;7u,1l',
        ],
    ],
    [
        ['Gabon', 'Gabon', 'GAB', null],
        0,
        [
            '8p8,1qt;d8,1u;gv,-3q;gg,3l;3h,-1j;-21,-c4;7s,-ed;ko,2a;6x,-5j;-c1,-w6;d5,-gg;31,-lo;-3i,-ih;-8j,-d5;-oi,16;-ev,dc;-27,-cb;-ir,-3e;-9j,-70;ah,-id;-l5,-fc;-sk,s2;-id,mx;-gv,sp;w,98;62,8w;6r,k8;5m,kl;9d,1m;14f,-a;-9,xf',
        ],
    ],
    [
        ['Niger', 'Niger', 'NER', null],
        0,
        [
            'bgj,hn3;6u,-176;ae,-79;g,-8u;bk,-9i;-61,-bz;-aq,-1kd;-1g,-105;-zg,-q7;-c0,-10l;bl,-aa;-3,-hw;hu,-n;-2s,-d3;-7u,-1l;-x,-8u;-56,-m;-is,ue;-6j,14;-lq,-fj;-li,84;-ey,1m;-81,-3w;-ga,u;-ge,-bu;-e6,-o;-xm,ed;-d6,-6u;-e7,h;-af,ai;-ru,ad;-tv,-3b;-78,-60;-3x,-fz;-7y,-b7;-1y,-ot;-l6,g0;-9z,-3;-9c,-85;n,j1;-w1,6b;-v,dg;-fn,i5;-3q,cn;27,dh;ht,13;aa,9w;11w,2e;oo,4e;2d,h4;f7,ik;-3,1rz;137,ce;28f,1il;2n7,1gy;17x,-bz;fn,-fa;jn,ac',
        ],
    ],
    [
        ['Burkina Faso', 'Burkina Faso', 'BFA', null],
        0,
        [
            '-464,803;-1v,g4;7l,bs;-n,9f;m2,n1;43,j1;7m,6s;df,-3q;bn,5n;3s,75;lk,cg;5b,8p;pz,bj;fa,3y;6y,-5c;ht,5;-27,-dh;3q,-cn;fn,-i5;v,-dg;w1,-6b;-n,-j1;-62,-8b;-dl,-2l;-5o,-c5;-9j,-36;-oc,m;-cv,27;-8z,-4h;-c9,21;-1c9,-1b;-o,-fs;3t,-kx;-j1,76;-d0,-12;-9q,-6z;-ci,5v;-4v,97;-ch,62',
        ],
    ],
    [
        ['Togo', 'Togo', 'TGO', null],
        0,
        [
            'p0,8hh;-3k,-em;8i,-87;9n,-9r;12,-dm;5l,-5q;-19,-1rt;6u,-j6;-md,-5x;-67,9r;-7f,hm;-27,du;65,p0;-6z,a5;-2n,lw;2,k6;-bm,ec;22,8o;oc,-m',
        ],
    ],
    [
        ['Ghana', 'Ghana', 'GHA', null],
        0,
        [
            'o,8i3;-22,-8o;bm,-ec;-2,-k6;2n,-lw;6z,-a5;-65,-p0;27,-du;7f,-hm;67,-9r;-17k,-ga;-fg,-9i;-p1,-83;-or,7w;19,az;-c1,nx;78,ve;bq,nc;-7d,13i;-3t,kx;o,fs;1c9,1b;c9,-21;8z,4h;cv,-27',
        ],
    ],
    [
        ['Guinea-Bissau', 'Guinea-Bissau', 'GNB', null],
        0,
        [
            '-cv9,9k1;ep,4j;97,-w;7h,34;1fc,-16;-j,-9f;-31,-2w;2d,-98;-4e,-3o;-64,-2;-79,-4o;-8g,j;-cc,-dk;-eu,bm;-bp,1v;-6e,7u;6,48;-8h,5w;-1r,5y',
        ],
    ],
    [
        ['Egypt', 'Egypt', 'EGY', null],
        0,
        [
            'sg2,gz4;-326,0;-2zs,0;-33o,0;0,2ua;0,2qt;-8c,md;76,h6;-4b,bv;a2,dc;10y,h;qr,-7d;rk,-87;cw,-4c;ld,8t;bg,7y;oi,2b;jr,-3i;7k,-ds;6g,92;ma,-6k;ln,-1l;do,70;0,0;fi,-14i;2s,-78;-7t,-b6;-5z,-kz;-7k,-eh;-6i,-4u;-99,8y;-cj,cf;-ju,13t;-2v,-2j;bj,-tb;h2,-rx;l0,-17a;a9,-f3;8x,-fp;ox,-ur;-5i,-4v;w,-i2;wd,-ox;4v,-5p',
        ],
    ],
    [
        ['Mauritania', 'Mauritania', 'MRT', null],
        0,
        [
            '-d5z,g7c;62,99;30s,-6;-5a,144;6t,ea;q1,2i;-w,1z2;2j6,-1g;3,163;2wh,-1v9;-16j,-i;df,-3bw;de,-3bw;4u,-3f;-67,-jg;-33g,-g;-46,-66;-ar,1u;-fo,-5h;-je,7q;-8t,-n;-4o,-gd;-9d,-52;-ic,j3;-gt,kf;-ig,7d;-d9,86;-fj,-b;-dk,-62;-dt,2f;-9i,-8x;-2f,ez;7r,dp;3h,q5;-33,rh;-3d,dt;2s,dv;-76,d7;-en,c0',
        ],
    ],
    [
        ['Eq. Guinea', 'Equatorial Guinea', 'GNQ', null],
        0,
        ['7g1,1rg;197,-n;9,-xf;-14f,a;-9d,-1m;-57,47;9j,v7'],
    ],
    [
        ['Gambia', 'Gambia', 'GMB', null],
        0,
        [
            '-cwa,ahn;u9,t;6a,6k;8t,g;az,-6u;8m,-4;96,4o;5m,-81;-c1,-68;-c2,h;-bx,5w;-ab,-6f;-4z,-9;-6o,-3w;-pb,l;3k,cc',
        ],
    ],
    [
        ['Madagascar', 'Madagascar', 'MDG', null],
        0,
        [
            '1288,-9me;7d,-bt;6w,-id;4g,-xf;78,-d0;-2s,-db;-4x,-86;-9f,ga;-58,-88;5a,-kl;-2g,-bs;-7o,-6f;-1r,-nj;-ay,-we;-dp,-12a;-h6,-1gn;-an,-12m;-ck,-w8;-mm,-6k;-o8,-br;-g0,73;-m2,9y;-7o,en;-1u,on;-9s,m5;-2k,k0;4z,k1;ct,4t;2,99;da,l2;2i,hp;-6g,d5;-59,hj;-28,pl;9p,fk;3r,hm;du,11;fi,5p;aa,51;c7,d;fu,fu;mv,h4;8c,dz;-3s,bv;bt,-3c;fb,jb;j,gp;97,cf;9p,-bx',
        ],
    ],
    [
        ['France', 'France', 'FRA', null],
        1,
        [
            [
                '-13uy,37g;-gf,-pf;-8j,-kg;-ao,-ak;-da,-20;-3t,7u;-68,16;-8l,-7j;-c5,5q;73,bo;2g,cq;4v,by;-ax,gh;-27,j0;eh,nw;9g,-32;kg,-6l;tf,-ng;4l,-be',
            ],
            [
                '4ru,1260;d4,-7a;141,-54;-e1,-j1;-3j,-js;-7n,-4r;-cn,2k;w,-72;-kc,-fm;-e,-cl;d9,4d;9k,-c7;-16,-7u;87,-ag;-9n,-8g;76,-li;f2,-3j;-37,-c2;-p6,-fp;-1is,7j;-14h,-91;-36,-gq;-w7,-3m;-v9,cl;-a4,-60;-1f5,cm;-b2,at;ed,go;5a,1jc;-so,t5;-kh,e2;-16h,ap;-2s,k9;100,62;1an,-76;-8s,vg;q8,-bx;1so,lo;8c,ms;ob,5m;40,-9s;cx,-h;cx,-b5;je,-d4;e9,26;ob,-co;68,-2e;80,l',
            ],
            ['6qy,ww4;hw,am;4q,-nu;-96,-lg;-cm,5o;-6g,ip;5m,ab'],
        ],
    ],
    [
        ['Ukraine', 'Ukraine', 'UKR', null],
        0,
        [
            'oiy,147a;ad,-15;71,6c;8g,-1f;st,2p;hr,-fq;-6y,-5n;2b,-8m;m5,-1c;9w,-c2;-m,-5h;za,-9r;lb,4e;h6,-d0;g8,a;14y,-91;c,-86;-ba,-ej;65,-fc;-4e,-99;-qv,-21;-ec,-7s;-v,-cc;-m7,-28;-ih,-8z;-q0,-1h;-ny,-ad;1f,-ev;-47,u;-3m,5i;-8y,13;-jr,5z;-7b,-6w;-3t,31;-177,70;-1x,ad;-pq,-3f;-ab,-fb;-lj,-kj;-cl,4s;-d2,-4h;-ce,54;6z,31;4v,9j;7m,8v;-1z,4z;5t,28;2r,-3v;gd,-t;7d,22;-57,2t;1z,45;-9p,73;-41,bm;-a4,4j;20,9f;-ck,7h;-bf,12;-kh,8n;-ih,-2r;-6n,-43;-bq,0;-6z,-6i;-ki,-2o;-9i,-49;-cw,6s;-ht,4;-h7,32;-bz,-5y;-1y,7g;-ff,7k;5f,b7;7p,79;62,-1n;-76,ci;p9,n4;ds,38;2z,7s;-dz,o9;da,13;f8,7j;lj,n;s2,-27;v0,-6o;lw,-k;ag,-40;af,4u;7a,-6i;p2,1c;b2,-2o;1s,dz;8l,63;nu,1o',
        ],
    ],
    [
        ['Belarus', 'Belarus', 'BLR', null],
        0,
        [
            'lqp,17c9;t9,-6z;3y,-6w;ek,3b;r6,-6m;2q,-d1;-5y,-7i;he,-i7;bb,-52;-1o,-51;ir,-4w;80,-7f;-at,-62;-mf,y;-5d,-2l;6j,-98;6u,-hs;0,0;-nu,-1o;-8l,-63;-1s,-dz;-b2,2o;-p2,-1c;-7a,6i;-af,-4u;-ag,40;-lw,k;-v0,6o;-s2,27;-lj,-n;-f8,-7j;-da,-13;-j,ce;-8l,cv;go,5o;6,b3;-7p,ak;-18,ca;qv,-6;u5,ag;6g,fp;ms,8w;-2m,cg;gw,4o;tv,aq',
        ],
    ],
    [
        ['Lithuania', 'Lithuania', 'LTU', null],
        0,
        [
            'kfy,16wv;2m,-cg;-ms,-8w;-6g,-fp;-u5,-ag;-qv,6;-6o,8l;-e9,2z;-28,73;2z,7m;-ca,4e;-t4,4v;-5w,nd;vt,8j;1al,-1s;rb,2r;3w,-5s;es,-1t;qp,-dh',
        ],
    ],
    [
        ['Russia', 'Russia', 'RUS', null],
        1,
        [
            ['3twl,1iuz;zf,bl;0,-j0;-uh,-1f;-4y,8u'],
            [
                '11vx,zsv;-co,-gh;-qx,-4l;-rm,-so;p9,-qd;-2q,-ip;ub,-wq;0,0;-gl,-b7;-4r,-73;-cb,1x;-j3,gv;-7t,y;-hh,6f;-8i,bf;-pw,5t;-gv,-4d;-4v,56;-11u,db;-14w,4i;-nh,4r;-3e,-3a;-zf,nh;-vp,ah;-o0,gc;k8,4g;n2,n8;-fj,b0;14y,bc;-r,62;-ox,-4h;v,cc;ec,7s;qv,21;4e,99;-65,fc;ba,ej;-c,86;-14y,91;-g8,-a;-h6,d0;-lb,-4e;-za,9r;m,5h;-9w,c2;-m5,1c;-2b,8m;6y,5n;-hr,fq;-st,-2p;-8g,1f;-71,-6c;-ad,15;0,0;-6u,hs;-6j,98;5d,2l;mf,-y;at,62;-80,7f;-ir,4w;1o,51;-bb,52;-he,i7;5y,7i;-2q,d1;-r6,6m;-ek,-3b;-3y,6w;-t9,6z;-8y,ge;-2d,dh;-de,6f;bx,8t;-89,px;js,g0;-47,4u;0,0;vl,fd;-t4,d8;0,0;1nh,zg;pt,g2;ag,e6;-154,j1;bd,i3;-p1,kp;iq,nt;-wb,vm;pm,ky;-16j,ij;42,jg;mg,2k;1b9,b5;0,0;so,9o;19m,-gt;243,-6m;2wy,-vf;lc,-d7;1u,-ih;-uu,-em;-19d,-7e;-3g0,l4;-kf,-3j;19b,-kd;1s,-cw;1t,-se;zr,-8h;lq,-77;3l,dh;-gq,bx;ho,aj;1v5,-ha;nf,6r;-ip,kd;1sq,r7;pn,-1l;py,-9q;g6,j3;-n6,gk;dm,gn;-kf,h8;25p,-8x;fv,-fk;-z6,-3f;7,-fh;lv,-9i;16x,61;6t,hp;1m1,d9;2ox,nu;kz,-1d;-re,-gv;yg,-2w;jx,9i;1g2,r;159,bj;vn,-gr;vl,if;-t4,g3;eg,96;2a2,-8f;12g,-8o;2so,-vr;il,ek;-s9,eo;-t,5w;-xh,2r;96,d6;-ev,lo;-u,8w;1f9,p6;i8,p8;ko,5h;21k,-7c;5s,-fg;-qc,-mj;ha,-8v;8y,-jf;-6b,-122;un,-h1;-bx,-ik;-1if,-13g;vr,-43;b2,a0;uk,74;7e,dr;o1,d8;-g7,ft;cz,ic;-ue,2a;-6o,fh;m6,rw;-103,mn;1dq,iq;-6g,jr;dv,n;em,-fe;-az,-qt;tq,-53;-co,k1;1ai,ax;1ln,1h;1fc,-fu;-op,n5;-2s,tl;1cb,5m;1ut,-18;1o7,3n;-mk,ej;w5,i8;vx,s;1i0,ds;21d,3p;99,7m;20y,2l;mq,-69;1qd,es;1f1,-h;7n,c0;qk,bu;1tl,be;1bn,-90;-11u,-6v;1qx,-49;7i,-dq;pe,6r;297,-d;1qn,-dk;ma,-ae;-6x,-eg;-uq,-88;-210,-ff;-kv,-89;yg,-3w;153,-70;p1,59;e6,-hu;c7,78;18f,4e;2h4,-4l;6s,-d0;385,-45;1l,l8;1my,-4v;18c,5;18v,-em;ct,-hs;-gg,-bn;yw,-lv;17p,-ba;qt,t5;18k,-ci;1bc,7h;1hs,-8j;kg,7s;19g,-3w;-k2,ps;10o,c1;6yw,-i1;nn,-gi;20q,-l8;346,59;1jb,-4k;n4,-bi;-3d,-kb;y8,-7x;116,5p;1d9,q;1gg,-5g;1go,33;1ce,-op;yf,8w;-mh,hr;cd,cc;2gn,-7s;1ls,1o;27w,-d9;12w,-c4;0,-32o;-7,-6;-zq,-c7;-100,21;p2,-es;gj,-mw;cu,-7h;38,-bi;-76,-7d;-1fs,62;-25n,-kx;-op,-38;-16i,-jj;-14b,-h2;-a8,-cm;-13r,j8;-20d,-lt;-cn,ab;-qr,-bw;-116,3t;-8y,-ia;-xc,-qw;10,-b8;vn,-68;-3q,-14g;-ps,-11;-bx,-n8;bk,-bz;-1ck,-e7;-9n,-vp;-15f,-6s;-8c,-s8;-141,-pw;-aa,j5;-bw,14j;-fi,1pq;dc,12j;ng,gl;1g,cz;176,68;1dn,yz;1bt,sk;1dy,m6;mc,136;-xs,-2d;-go,-mv;-1yh,-uj;-mr,y6;-1zp,-9g;-1xj,-1ak;my,-h1;-1q0,-79;-16y,-2v;20,k3;-176,48;-yf,-do;-2cy,4s;-2jd,-88;-2i0,-1i8;-2yg,-1ti;17s,-3i;dn,-hf;r0,-66;hs,dw;uh,-1t;143,-uk;y,-nn;-lq,-rr;-2c,-x6;-cj,-18f;-15v,-147;-9b,-j8;-11q,-wc;-11f,-w3;-hy,-gf;-110,-gb;-hj,-d;-hg,dj;-11a,-kc;-4c,-99;0,0;0,0;0,0;-3w,4v;0,0;-6,e4;e7,r;40,wu;-7c,ns;nu,9t;xq,-4x;ip,r1;9i,uf;at,a6;el,p0;-19w,-87;-o3,-ay;-168,1;-b9,q4;-ww,jr;-1cd,8v;-aa,r8;-9o,h2;-af,by;-h6,s1;-oe,a8;-15l,8a;-10t,-r;-yj,-51;-my,-dt;f9,-6m;c,-fc;-fg,-8w;-p3,-th;9,-c8;-135,-hk;-xc,ai;-x5,-2c;-ek,9b;-go,30;-14o,-jk;-10l,-4m;-pj,-6w;-z0,4j;-pr,-a;-gv,e7;-r7,dc;-ru,3o;-z5,-3n;-q9,-55;-13h,bp;-5b,kt;-wo,75;-p7,39;-v5,bh;-sr,-ss;ba,-gd;-r0,-jc;-146,6z;-rq,10;-ik,d0;-t0,e;-o5,8j;-169,-d2;-1h0,-nx;-tb,-4u;-av,-2a;-er,h0;-zs,-3q;-bt,bs;-jg,5e;-dd,g2;-fc,50;-13x,-75;-12a,g0;-es,-ej;-1q3,1yj;-zg,lh;a6,8q;-1xm,-q8;-qn,-1l;2b,f6;-zp,9h;-t0,-6s;-8r,st;-1dx,5z;-oz,-bj;-1xi,-a9;-dk,-6v;-2vy,-9o;-cr,-9h;k2,-j1;-qo,-78;57,-7k;-qn,-dk;190,-j3;-6z,-d6;-130,17;-83,-89;-zj,ef;-181,-k;-th,-bq;-ww,b8;-1p8,j9;-17e,-q;-1ld,-u8;-3g,-ka;-sl,g4;-m5,-uj;84,-5o;-g2,-l2;nl,-iu;km,s;hq,-ik;-2u,-eb;e4,-4i',
            ],
            [
                '20cy,1qip;1o3,69;1hz,-dz;1rz,-qv;-6v,-oz;-1om,-3h;-25d,81;-1a4,am;-lc,jx;-11w,5h;205,j0',
            ],
            ['27cm,1p69;1ye,-fs;-89,-ba;-4cl,-aq;1er,10h;mt,34;kw,-1t'],
            [
                '2z4f,1mqx;21d,-18;2se,-eq;-lu,-kn;-2ue,s;-1a3,-6l;-1j1,i3;ey,j3;10n,58',
            ],
            ['36da,1m4y;1xq,-7a;-w4,-az;-18f,2h;-1fm,az;6n,90;1fs,-47'],
            ['2zx3,1km2;qd,az;yq,2l;13h,-an;3d,-7b;-164,-7;-1ky,34;-4v,1h'],
            [
                'ylr,1q6m;1i8,52;167,c;5p,-7h;fy,6n;q7,4l;157,-63;-ar,-49;-11a,-3o;-p0,-23;-3v,-4l;-wh,-4l;-u3,6l;ft,8o;-1pt,v',
            ],
            [
                'hjf,15x4;-1f3,-f;-y7,35;6b,c8;12c,90;t4,-4v;ca,-4e;-2z,-7m;28,-73',
            ],
            [
                '15ac,1kwm;1ui,od;-7i,cm;1q5,eo;2jp,hv;2kg,57;1bl,ab;1i2,3m;jb,-az;-in,-8n;-2qg,-ds;-2ct,-d9;-2eb,-qg;-15e,-r4;-17k,-qq;5o,-n2;1h5,-mt;-gf,-2f;-2is,3m;-7d,cc;-1ea,7g;-42,f0;se,5y;-y,f6;1j4,np;-pk,3e',
            ],
            [
                '329v,15ft;9m,-qs;-q,-rc;bh,-s1;ry,-1d8;-154,97;-h3,-145;r2,-sh;-s,-jf;-l1,gr;-i8,-li;-55,nb;33,r2;-36,tz;6g,l0;18,115;-ga,rb;2h,11z;po,cs;-b1,cv;cd,3x;78,-id',
            ],
            [
                '-3qz4,1fuu;-2e,-ha;iq,-6w;-6g,k6;23f,-45;1id,-q0;-rj,-c4;-19j,-2v;-p,-r5;-b4,-5s;-q1,u;-l6,9o;-10y,84;-67,c2;-s8,4j;-vl,-3l;-f3,9p;61,ac;-xa,-6l;cj,-d3;-fr,-bs;0,32o;1w2,-l8;20u,-rm',
            ],
            ['-3tvq,1ip9;-10a,-1p;0,j0;3k,16;nk,-2;146,-7z;-2e,-3s;-sm,-6o'],
            [
                'pss,zh0;7b,6w;jr,-5z;8y,-13;3m,-5i;47,-u;8,-2f;dl,-6p;sc,1o;-5f,-9x;-uf,-4t;-11p,-g3;-fh,5o;65,d2;-ud,84;4x,5c;ql,99;-48,3c',
            ],
        ],
    ],
    [
        ['Czechia', 'Czechia', 'CZE', null],
        0,
        [
            'bl5,13fn;d6,-8y;ks,-2f;-1r,-7n;f3,-5r;46,76;j2,-34;2m,-8p;ko,-1o;cs,-dp;-8a,-1;-4b,-50;-6e,-17;-1t,-6c;-5b,-1c;-s,-2l;-9h,-2v;-cb,h;-3y,-64;-ct,59;-d1,-1g;-ll,8h;-9s,-23;-fm,-bd;-kn,8y;-fp,by;-e6,6o;-2y,bq;-4v,89;k7,62;ab,6x;jy,5e;6z,5a;7c,-37;ce,2x',
        ],
    ],
    [
        ['Germany', 'Germany', 'DEU', null],
        0,
        [
            'aw8,15h9;6h,-e5;-7q,-7f;a3,-9w;6v,-ev;-26,-9l;be,-hq;-ce,-2x;-7c,37;-6z,-5a;-jy,-5e;-ab,-6x;-k7,-62;4v,-89;2y,-bq;e6,-6o;fp,-by;-9t,-ct;-9z,-3j;3y,-i3;-2l,-4q;-8o,5o;-dc,v;-jv,-4z;-oh,16;-3z,-7c;-e2,7q;-8e,-1j;-tr,8i;-5q,-61;-nm,7;3j,js;e1,j1;-141,54;-d4,7a;1l,c6;-5k,6a;36,is;-4o,t4;go,0;72,ag;6x,pg;-57,9e;5f,5w;n8,1i;56,-64;iv,dp;-6d,af;-1a,fr;l0,-3o;hs,48;i,-aq;s2,-6h;-b,-9v;s9,57;fm,7m;vd,-ay;d5,-8v',
        ],
    ],
    [
        ['Estonia', 'Estonia', 'EST', null],
        0,
        [
            'll9,19w3;0,0;47,-4u;-js,-g0;89,-px;-bx,-8t;-mw,1;-nx,ac;-c6,3e;-no,-4x;38,ge;-a8,-3i;-hm,9w;-2f,fy;z4,7r;z0,41;u5,-4l;so,t;0,0',
        ],
    ],
    [
        ['Latvia', 'Latvia', 'LVA', null],
        0,
        [
            'l20,18cj;de,-6f;2d,-dh;8y,-ge;-tv,-aq;-gw,-4o;-qp,dh;-es,1t;-3w,5s;-rb,-2r;-1al,1s;-vt,-8j;y,kx;do,hg;q6,9h;m2,-kr;mb,k;5c,lb;no,4x;c6,-3e;nx,-ac;mw,-1',
        ],
    ],
    [
        ['Norway', 'Norway', '-99', null],
        1,
        [
            [
                'bon,1ph6;ak,9i;14s,z;z1,-9p;2jg,-kq;-1xx,-ax;-ff,-kg;-oe,-59;-d8,-n1;-xh,-13;-1nq,gy;p7,9w;-15n,81;-1i5,ng;-ll,lr;23q,9y;f8,-9q;13k,e',
            ],
            [
                'nzx,1ho6;-1b9,-b5;-mg,-2k;bs,jh;-zo,b2;-174,-9f;-dn,-kd;-qh,-ca;-tu,6p;-10a,-1d;-uv,eo;-gn,-7c;-h9,-15;-42,-ia;-1gd,4g;-7d,-fg;-qo,3;-ic,-js;-rt,-us;-174,-133;a4,-9i;-9o,-b0;-rk,h;-i1,-q2;1p,-10w;hr,-e2;-97,-wo;-n4,-j2;-c9,-g0;-im,h2;-1iv,-w5;-111,-6i;-12f,e5;-9y,tv;-8s,1s4;pl,hv;21c,nc;1iv,so;1eu,12q;1ur,1hn;1aj,kw;24c,yu;1oy,c6;19q,-1h;16b,n0;1en,-18;1dw,5j;2ev,-kb;-zs,-7g;ug,-hg',
            ],
            [
                'l5c,1prs;-157,-ey;-28l,-3a;-29x,4n;-4y,7n;-13v,i;-ue,cr;2ds,7r;14c,-6o;s3,8b;1y9,-6y;1ig,-9r',
            ],
            ['j2s,1o2m;-1q2,-bd;-1d0,6g;j6,76;-gs,8w;1lk,5k;b1,-af;143,-6a'],
        ],
    ],
    [
        ['Sweden', 'Sweden', 'SWE', null],
        0,
        [
            '8ib,19ew;c9,g0;n4,j2;97,wo;-hr,e2;-1p,10w;i1,q2;rk,-h;9o,b0;-a4,9i;174,133;rt,us;ic,js;qo,-3;7d,fg;1gd,-4g;42,ia;h9,15;111,-dl;17c,-ix;r,-16s;9d,-at;-1bs,-7v;-qx,-je;4c,-h0;-187,-mc;-1hn,-nx;-k8,-134;jr,-jk;ql,-ff;-pj,-vc;-sw,-6i;-al,-1an;-fs,-q1;-xp,2p;-fq,-m1;-w6,-1a;-8u,q9;-n9,vj;-l5,13a',
        ],
    ],
    [
        ['Finland', 'Finland', 'FIN', null],
        0,
        [
            'm28,1hah;-42,-jg;16j,-ij;-pm,-ky;wb,-vm;-iq,-nt;p1,-kp;-bd,-i3;154,-j1;-ag,-e6;-pt,-g2;-1nh,-zg;0,0;0,0;-1ef,-28;-1cu,-a7;-197,-5v;-g3,f6;-qx,94;67,rd;-di,p2;d9,g7;p7,hg;1rk,u4;ij,5t;-2w,br;-12n,d5;-9d,at;-r,16s;-17c,ix;-111,dl;gn,7c;uv,-eo;10a,1d;tu,-6p;qh,ca;dn,kd;174,9f;zo,-b2;-bs,-jh',
        ],
    ],
    [
        ['Luxembourg', 'Luxembourg', 'LUX', null],
        0,
        ['4nv,12og;5k,-6a;-1l,-c6;-80,-l;-68,2e;30,fl;79,12'],
    ],
    [
        ['Belgium', 'Belgium', 'BEL', null],
        0,
        [
            '4r1,1378;-36,-is;-79,-12;-30,-fl;-ob,co;-e9,-26;-je,d4;-cx,b5;-cx,h;-40,9s;m9,5h;0,0;0,0;kc,-27;pr,5s;hl,-c6;fa,-6h',
        ],
    ],
    [
        ['North Macedonia', 'North Macedonia', 'MKD', null],
        0,
        [
            'h9p,wnk;dw,-8x;1z,-id;-5a,-x;-4l,-4v;-f2,k;-al,-63;-i6,-2g;-bj,6r;-3y,bx;3j,9g;0,0;3j,-8;19,5p;gf,4b;68,12;9g,1n;cw,g',
        ],
    ],
    [
        ['Albania', 'Albania', 'ALB', null],
        0,
        [
            'g7w,vij;-k,-7b;-91,-41;-1o,-91;-cx,-dh;-4q,1y;-k,64;-fe,9c;-2f,d8;2d,iz;3s,8m;-4o,4e;0,0;-1w,8u;c2,do;1s,-58;7h,2h;5x,-7h;6n,-2u;1v,-a3;0,0;-3j,-9g;3y,-bx;bj,-6r',
        ],
    ],
    [
        ['Kosovo', 'Kosovo', '-99', null],
        0,
        [
            'fvy,wan;-1v,a3;-6n,2u;-5x,7h;57,68;6n,20;3u,98;4z,1j;3z,-3x;56,-1q;3n,-4f;4l,-1b;5e,-56;3y,6;-34,-6s;-3c,-3b;y,-23;-68,-12;-gf,-4b;-19,-5p;-3j,8',
        ],
    ],
    [
        ['Spain', 'Spain', 'ESP', null],
        0,
        [
            '-5r2,smi;-2b,97;aa,af;3u,7k;-9l,89;7o,i9;-b5,go;c0,2a;15,d5;4i,42;d,lo;cu,7j;-7s,dx;-g6,z;-4s,-3i;-ge,-1;-6z,dl;-bc,-41;-a3,-72;1f,js;-bd,c2;13b,k1;y0,-50;11a,6;tk,-4r;n2,1h;18x,-x;b2,-at;1f5,-cm;a4,60;v9,-cl;w7,3m;1h,-g5;-qb,-ii;-zl,-5v;-2i,-9d;-h2,-fe;-aq,-mm;au,-fv;-g2,-cf;-60,-i2;-kz,-5j;-jo,-ld;-za,-f;-qh,j;-he,-9t;-am,-ai;-dl,2b;-ab,9e;-7v,fz;-py,4b',
        ],
    ],
    [
        ['Denmark', 'Denmark', 'DNK', null],
        1,
        [
            [
                '7nm,16fb;-hs,-48;-l0,3o;-ba,ff;-u,se;4n,7i;7y,8c;oh,1q;9s,7o;mc,7u;-y,-ea;-88,-92;3c,-7s;f2,-47;-6s,-ai;-8a,31;-k0,-k0;7k,-dj',
            ],
            ['9jn,17an;8v,-dx;-go,-mi;-t2,fp;-3w,bj;14r,97'],
        ],
    ],
    [
        ['Romania', 'Romania', 'ROU', null],
        0,
        [
            'lsa,z3k;ce,-54;d2,4h;cl,-4s;o,-76;-dh,-5z;-8g,2m;-7s,-xj;-gc,2x;-k8,a4;-wp,-6h;-ds,-73;-14s,1h;-ld,4c;-ar,-21;-80,bf;-53,4u;6g,4p;-6v,3h;-8q,-69;-g7,83;-26,bg;-gy,6j;-34,8v;-f2,aw;ma,59;gt,iu;d5,iu;gz,5u;bz,5y;h7,-32;ht,-4;cw,-6s;9i,49;ki,2o;6z,6i;bq,0;8h,-2q;8m,-88;8t,-bq;g1,-gj;w,-c6;-2y,-bv;50,-cp',
        ],
    ],
    [
        ['Hungary', 'Hungary', 'HUN', null],
        0,
        [
            'h1i,11d2;ff,-7k;1y,-7g;-gz,-5u;-d5,-iu;-gt,-iu;-ma,-59;-hc,19;-la,-7b;0,0;-ae,-46;-my,5d;-kr,bx;-8u,3f;-5e,9d;-4p,b;98,hw;-5d,61;fn,2;24,bc;e4,-74;a9,-31;nc,3f;28,5l;b1,t;dj,4c;30,-1s;d2,3h;6j,6j;93,1p;tr,-8g;5y,2u',
        ],
    ],
    [
        ['Slovakia', 'Slovakia', 'SVK', null],
        0,
        [
            'hem,11vi;-7p,-79;-5f,-b7;-5y,-2u;-tr,8g;-93,-1p;-6j,-6j;-d2,-3h;-30,1s;-dj,-4c;-b1,-t;-28,-5l;-nc,-3f;-a9,31;-e4,74;-2s,9n;28,3j;3y,64;cb,-h;9h,2v;s,2l;5b,1c;1t,6c;6e,17;4b,50;8a,1;1l,-1o;bf,3s;e0,-9v;gf,5y;d4,-2u;k0,3x;qe,-ao',
        ],
    ],
    [
        ['Poland', 'Poland', 'POL', null],
        0,
        [
            'i4c,15lk;18,-ca;7p,-ak;-6,-b3;-go,-5o;8l,-cv;j,-ce;dz,-o9;-2z,-7s;-ds,-38;-p9,-n4;76,-ci;-62,1n;-qe,ao;-k0,-3x;-d4,2u;-gf,-5y;-e0,9v;-bf,-3s;-1l,1o;-cs,dp;-ko,1o;-2m,8p;-j2,34;-46,-76;-f3,5r;1r,7n;-ks,2f;-d6,8y;-be,hq;26,9l;-6v,ev;-a3,9w;7q,7f;-6h,e5;iz,86;17c,cu;z0,9f;rq,-4p;23,-6s;qt,-d;y7,-35;1f3,f;e9,-2z;6o,-8l',
        ],
    ],
    [
        ['Ireland', 'Ireland', 'IRL', null],
        0,
        [
            '-4s6,15kc;4l,-jv;-l0,-ot;-1d9,-gf;-13b,47;mj,t1;-ej,s8;11t,ls;l0,cz;5q,-ew;-5q,-ew;h6,e;l0,-5q',
        ],
    ],
    [
        ['United Kingdom', 'United Kingdom', 'GBR', null],
        1,
        [
            ['-4s6,15kc;-l0,5q;-h6,-e;5q,ew;-5q,ew;na,15;ts,-h6;-ew,-j3'],
            [
                '-2dy,157h;2,-1;43,g5;-im,h4;-f,e;-xq,4w;-6n,7j;a4,ce;-95,7o;-ey,-d5;-1n,qs;-e1,e6;a3,sq;ll,mj;m7,-27;xi,2c;-tp,-u2;sb,3t;ug,-5;-79,-mn;-oz,-ow;sq,-1s;27,-2x;or,-ws;j1,-4h;h3,-vn;7x,-az;xo,-5a;-3e,-hs;-e5,-85;b3,-ee;-p0,-ej;-116,9;-1ba,-7n;-cy,5h;-id,-d1;-pq,36;-ji,-am;-es,5k;14r,t6;ov,60;-8,1;-17d,4m;-7v,b2;t1,8m;-f8,ez;5a,i7;15a,-2i',
            ],
        ],
    ],
    [
        ['Greece', 'Greece', 'GRC', null],
        1,
        [
            [
                'kaa,r8k;-3h,-87;-140,-2d;a,4l;-xw,5f;55,bt;f7,-9d;lm,1l;ko,-1z;-o,-4u;f5,3c',
            ],
            [
                'hpk,vwa;kk,-t;m9,7n;jk,-9q;p9,2n;b,du;dj,-7d;-8l,-he;-6m,-34;-gx,t;-ei,2m;-xn,-78;j9,-fm;-e4,-4j;-fh,-1;-ep,eb;-58,-63;68,-gm;dw,-d1;-ah,-63;fh,-ct;dr,-82;f,-fp;-pp,7d;87,-e6;-hn,-2x;aj,-oi;-ig,-d;-ms,c3;-af,m8;-4v,ih;-au,cs;-e8,fu;-1w,7x;cx,dh;1o,91;91,41;k,7b;i6,2g;al,63;f2,-k;4l,4v;5a,x',
            ],
        ],
    ],
    [
        ['Austria', 'Austria', 'AUT', null],
        0,
        [
            'd3o,114r;-24,-bc;-fn,-2;5d,-61;-98,-hw;-5a,-4o;-ob,-p;-e1,-6b;-my,25;-13q,77;-67,9n;-rg,-4t;-38,-5b;-gu,3z;-e7,r;-ck,52;49,6t;-13,4x;8e,1j;e2,-7q;3z,7c;oh,-16;jv,4z;dc,-v;8o,-5o;2l,4q;-3y,i3;9z,3j;9t,ct;kn,-8y;fm,bd;9s,23;ll,-8h;d1,1g;ct,-59;-28,-3j;2s,-9n',
        ],
    ],
    [
        ['Italy', 'Italy', 'ITA', null],
        1,
        [
            [
                '823,106m;gu,-3z;38,5b;rg,4t;67,-9n;13q,-77;-30,-do;6o,-bu;-m4,42;-ml,-9v;1j,-dt;-3f,-7x;94,-e5;q2,-dz;dz,-mz;ux,-me;lr,6;6s,-65;-7t,-5j;ow,-a1;ke,-8f;nu,-eh;2v,-57;-57,-9y;-ff,cz;-o4,4k;-bp,-hz;k2,-aa;-3a,-ei;-bm,-1n;-eu,-nu;-bl,-25;4,8i;5o,ew;61,5y;-au,g3;-8h,e0;-bk,3h;-87,c0;-hu,51;-c1,b6;-kk,1t;-lp,ck;-pf,i2;-iw,g0;-8o,rh;-du,38;-ml,96;-cs,-3r;-g2,-cw;-bk,-21;37,c2;-f2,3j;-76,li;9n,8g;-87,ag;16,7u;by,-5y;de,1b;fl,9g;4t,-4f;d8,w;61,b7;kk,-3h;c8,4p;28,be',
            ],
            [
                'be1,tfk;l3,2f;-a0,-lv;46,-8m;-5u,-ea;-l9,ah;-e4,30;-12s,e4;3w,e9;wi,-2j;sc,31',
            ],
            [
                '6py,vk4;dw,8m;go,-jq;-3w,-10r;-cn,1r;-bc,-99;-aj,7d;-14,xi;-6c,fw;fa,-1e',
            ],
        ],
    ],
    [
        ['Switzerland', 'Switzerland', 'CHE', null],
        0,
        [
            '7ei,10o5;13,-4x;-49,-6t;ck,-52;e7,-r;-28,-be;-c8,-4p;-kk,3h;-61,-b7;-d8,-w;-4t,4f;-fl,-9g;-de,-1b;-by,5y;-9k,c7;-d9,-4d;e,cl;kc,fm;-w,72;cn,-2k;7n,4r;nm,-7;5q,61;tr,-8i',
        ],
    ],
    [
        ['Netherlands', 'Netherlands', 'NLD', null],
        0,
        [
            '5bt,159m;57,-9e;-6x,-pg;-72,-ag;-go,0;4o,-t4;-fa,6h;-hl,c6;-pr,-5s;-kc,27;0,0;eb,7n;oc,14v;120,bm;n3,-s',
        ],
    ],
    [
        ['Serbia', 'Republic of Serbia', 'SRB', null],
        0,
        [
            'ej2,zf9;0,0;la,7b;hc,-19;f2,-aw;34,-8v;gy,-6j;26,-bg;g7,-83;8q,69;6v,-3h;-6g,-4p;53,-4u;-6v,-6b;2i,-a5;di,-c0;-al,-8o;-4o,-8v;30,-3b;-4k,-3x;-cw,-g;-9g,-1n;-y,23;3c,3b;34,6s;-3y,-6;-5e,56;-4l,1b;-3n,4f;-56,1q;-3z,3x;-4z,-1j;-3u,-98;-6n,-20;2a,2e;-al,5r;-95,30;-42,3u;-7d,4s;6j,18;42,d2;-de,ap;6y,c8;-a3,-3;0,0;ap,ah;-8t,7x;-6r,ar',
        ],
    ],
    [
        ['Croatia', 'Croatia', 'HRV', null],
        0,
        [
            'cs5,zvs;8u,-3f;kr,-bx;my,-5d;ae,46;6r,-ar;8t,-7x;-ap,-ah;-ck,66;-j7,-e;-nw,4m;-cz,-m;-61,-5s;-9z,6e;-5t,-bj;dm,-d0;60,-8m;cs,-ad;al,-66;ai,-bl;ol,-aj;-32,-4q;0,0;-q4,aa;-g4,a0;-pf,89;-nd,kg;5m,23;-co,bo;-i,9e;-hv,4e;-8j,-c0;-87,9b;m,9n;10,g;jd,-y;53,4p;9g,-4j;ax,-k;-4,7s;9o,2u;2p,b8;m4,7e',
        ],
    ],
    [
        ['Slovenia', 'Slovenia', 'SVN', null],
        0,
        [
            'ani,zvx;my,-25;e1,6b;ob,p;5a,4o;4p,-b;5e,-9d;-m4,-7e;-2p,-b8;-9o,-2u;4,-7s;-ax,k;-9g,4j;-53,-4p;-jd,y;67,2j;-6o,bu;30,do',
        ],
    ],
    [
        ['Bulgaria', 'Bulgaria', 'BGR', null],
        0,
        [
            'hhd,y4r;80,-bf;ar,21;ld,-4c;14s,-1h;ds,73;wp,6h;k8,-a4;gc,-2x;-ef,-bi;-a5,-jv;8z,-fv;-nx,3q;-sb,-8q;-b,-du;-p9,-2n;-jk,9q;-m9,-7n;-kk,t;-1z,id;-dw,8x;4k,3x;-30,3b;4o,8v;al,8o;-di,c0;-2i,a5;6v,6b',
        ],
    ],
    [
        ['Montenegro', 'Montenegro', 'MNE', null],
        0,
        [
            'fhj,wv1;-7h,-2h;-1s,58;-c2,-do;1w,-8u;-5u,25;-7s,93;-c0,5i;32,4q;42,fa;92,6h;57,2j;7d,-4s;42,-3u;95,-30;al,-5r;-2a,-2e;-57,-68',
        ],
    ],
    [
        ['Bosnia and Herz.', 'Bosnia and Herzegovina', 'BIH', null],
        0,
        [
            'ebk,wwq;-ol,aj;-ai,bl;-al,66;-cs,ad;-60,8m;-dm,d0;5t,bj;9z,-6e;61,5s;cz,m;nw,-4m;j7,e;ck,-66;0,0;a3,3;-6y,-c8;de,-ap;-42,-d2;-6j,-18;-57,-2j;-92,-6h;-42,-fa',
        ],
    ],
    [
        ['Portugal', 'Portugal', 'PRT', null],
        0,
        [
            '-6yz,wbd;a3,72;bc,41;6z,-dl;ge,1;4s,3i;g6,-z;7s,-dx;-cu,-7j;-d,-lo;-4i,-42;-15,-d5;-c0,-2a;b5,-go;-7o,-i9;9l,-89;-3u,-7k;-aa,-af;2b,-97;-b6,-78;-en,3x;-ec,-32;49,lq;-2m,h3;-cf,2k;-6o,aj;28,i7;b3,a3;1z,b8;5s,gq;-m,br;-5k,9z;-18,9e',
        ],
    ],
    [
        ['Moldova', 'Moldova', 'MDA', null],
        0,
        [
            'kjf,117h;6n,43;ih,2r;kh,-8n;bf,-12;ck,-7h;-20,-9f;a4,-4j;41,-bm;9p,-73;-1z,-45;57,-2t;-7d,-22;-gd,t;-2r,3v;-5t,-28;1z,-4z;-7m,-8v;-4v,-9j;-6z,-31;-50,cp;2y,bv;-w,c6;-g1,gj;-8t,bq;-8m,88;-8h,2q',
        ],
    ],
    [
        ['Iceland', 'Iceland', 'ISL', null],
        0,
        [
            '-b71,1fa0;-6f,-hz;ve,-iy;-104,-l7;-284,-j1;-ny,-53;-10l,44;-25i,8s;rd,ca;-1oh,dl;1d7,5e;-17,86;-1mb,6g;ir,i4;164,43;17b,-iu;167,f5;yy,-7v;19b,et;1a3,-1z',
        ],
    ],
    [
        ['Papua New Guinea', 'Papua New Guinea', 'PNG', null],
        1,
        [
            [
                '30so,-208;1c7,-j5;1fd,-fw;j5,-e9;fh,-dy;48,-ge;1aa,-h6;6r,-eq;-pk,-30;65,-ii;ot,-i8;i1,-th;fx,y;-14,-cb;lg,-4q;-8c,-59;tj,-bp;-33,-81;-if,-1x;-6u,77;-nv,34;-s2,47;-lm,hq;-fr,f9;-eg,oc;-108,c5;-nj,-7x;-gz,-96;3k,-ki;-lu,-9k;-fk,4n;-sq,16;-h,2ij;-h,2ij',
            ],
            [
                '39s0,-2to;ak,-8w;3c,-eg;-8p,-7e;-58,ge;-6h,aq;-cl,94;-ft,bv;-k2,86;7q,6p;f0,-7s;9g,-64;bo,-6o;b4,-bo',
            ],
            [
                '38qt,-4i9;-f7,-6r;-e9,-6i;-er,1;-ms,83;-fv,7r;2b,8l;ow,-42;f8,26;46,dc;40,p;2p,-er;fu,24;7v,9i;fi,9x;-32,gd;gn,j;5m,-4k;-k,-ff;-9c,-gy;-ek,-2a;-4e,-7t',
            ],
            [
                '3bew,-44c;8f,-6b;dh,-hm;d4,-9f;-3w,-7s;-7s,-2s;-c1,ao;-c6,hn;-5z,l6;3v,2p;2z,-8a',
            ],
        ],
    ],
    [
        ['Australia', 'Australia', 'AUS', null],
        1,
        [
            [
                '35yh,-vhk;go,-1v;1z,-wz;-9j,-9l;-2v,-md;-9p,7m;-jb,-jd;-5r,1i;-h3,v;-h4,ns;-3t,ic;-g1,o7;q,cr;i6,-2h;qu,-9l;f5,3t;lo,5d',
            ],
            [
                '2pc5,-ouw;-tg,-e9;-o3,-6e;-5d,-el;-a9,-ba;-nl,-o;-hg,-2h;-ok,52;-jz,-31;-j2,-1a;-gj,-et;-84,19;-dx,-7v;-dd,-8u;-k9,14;-in,0;-th,hr;-ex,59;m,fy;ds,3s;4q,6b;-10,a0;3f,jb;-34,gh;-ep,s2;-4k,fv;17,fu;-b2,i3;-q,86;-ca,b2;-3h,lr;-fw,m0;-3u,bu;c7,-c0;-9d,ps;ds,-82;88,-ar;-h,e8;-dr,lv;-2o,8r;-6f,8b;30,g3;5p,6u;3s,dw;-2y,g9;bh,jz;23,-l5;br,j3;mk,9b;dj,bu;l9,a7;cm,26;7o,-3f;lw,ad;gu,33;48,63;7c,2j;fd,-o;t7,85;f4,cc;73,ev;gb,e3;19,b3;q,f4;jg,nm;bp,-o0;bt,5k;-9w,d4;8q,di;c9,-61;3e,l5;f6,do;6p,az;dz,4q;g,7r;c7,-38;i,6z;c8,3z;df,3r;kj,-cr;ff,-gg;he,-7;hn,-2m;-5v,f9;db,ma;ci,7a;-4b,6x;c2,fw;gt,9s;e8,-3a;nc,58;-i,e7;-kc,95;es,41;if,-6v;er,-bf;ne,-73;7y,2t;h7,-8k;g9,7z;af,-2f;6i,5c;cs,-dr;-7f,-ev;-ak,-b8;-9j,-y;38,-b3;-86,-dw;-9v,-dn;1z,-7v;m3,-fc;le,-8x;eb,-9k;k3,-gh;7u,1;ek,-74;48,-8l;qi,-9f;ic,9i;5g,ex;5n,cb;3g,f8;8g,m4;-3v,dg;21,83;-38,fw;3n,kx;5c,5n;-4c,9a;6q,er;59,f9;q,7x;ab,af;7u,-dl;1y,-hg;6x,-3d;17,-bo;a3,-e4;23,-fq;-z,-a4;a0,-ls;hu,ah;97,-br;dc,-av;-2v,-cb;5x,-nu;48,-dv;70,-3e;7j,-nr;-2o,-ee;8z,-iu;u4,-ej;jn,-d7;im,-c3;-3n,-6q;fw,-hg;at,-u2;b3,64;ba,-c1;6s,4a;4t,-tg;jp,-h2;cx,-am;lp,-mi;7t,-mb;q,-fu;-1x,-h7;d8,-nm;-1l,-ol;-4t,-cv;-7i,-os;l,-fy;-5i,-jw;-ca,-pa;-kl,-dn;-a5,-lj;-99,-dq;-89,-nz;-aq,-dv;-71,-ks;-3l,-j5;1f,-8s;-fx,-9o;-v3,-10;-pn,-be;-cs,-as;-gs,-bx;-n0,ca;-h1,4x;4b,eh;-f6,-59;-oc,-k4;-o1,7j;-fr,4e;-fv,1z;-qw,82;-hz,h4;-55,l3;-6h,e2;-dn,b9;-qq,3d;94,dh;-6p,km;-dl,-j8;-oq,-54;ej,fe;48,g1;aq,dm;-28,kk;-ml,-np;-hd,-9i;-an,-m3;-lp,bf;v,er;-he,k5;-en,af;58,6f;-zn,gu;-jj,s;-qq,dj;-1dq,-2m;-zz,-9y;-vm,-9a;-qi,1u',
            ],
        ],
    ],
    [
        ['Fiji', 'Fiji', 'FJI', null],
        1,
        [
            ['3uw0,-ceb;0,-dk;-ho,-6u;-hr,-5v;-3k,ad;dw,5p;8t,1j;ga,8o'],
            [
                '3tfy,-di9;6w,4l;9k,-80;-4l,-ej;-h8,-3t;-fc,3g;-2o,c7;aq,9k;cn,-3g',
            ],
            ['-3uq9,-cd1;-3g,-dd;-2b,-1h;0,dk;5r,1a'],
        ],
    ],
    [
        ['New Zealand', 'New Zealand', 'NZL', null],
        1,
        [
            [
                '3shi,-uwy;-ai,-ez;-ds,-j1;-lg,-b2;-4s,7a;-bl,40;g1,mv;-94,fa;-tw,b4;s,a2;k3,9p;4o,le;-1a,hz;-b9,im;r,4w;-da,bh;-lv,ol;-bm,jo;ab,26;f4,-ff;lm,-77;7v,-or;k5,-t9;l,iz;cj,-7l;45,-l0;md,-92;is,-28;fv,al;e3,-37;-6q,-oo;-8h,-g7;-l7,k;-7f,-8g;2l,-by;-43,-56',
            ],
            [
                '3mx0,-xlv;nt,ej;go,ef;cd,kq;aj,71;44,fi;ji,cu;65,-bt;6b,-bh;jr,b9;82,-bq;1,-bp;-ad,-cv;-i5,-kh;-e8,-b6;a9,-dd;-lf,-d;-ns,-ah;-7g,-i6;-fs,-s4;-lu,-cf;-dv,-7x;-pl,l;-hz,96;-u7,1y;-4o,a7;ex,km;yy,rf;hx,58;jz,al',
            ],
        ],
    ],
    [
        ['New Caledonia', 'New Caledonia', 'NCL', null],
        0,
        [
            '3jx0,-g9k;ms,-h8;eg,-cs;-ak,-6o;-fa,7i;-jw,ci;-hw,eq;-ie,jl;-3u,9f;by,-e;fk,-9g;c8,-9g;8w,-7s',
        ],
    ],
    [
        ['Solomon Is.', 'Solomon Islands', 'SLB', null],
        1,
        [
            ['3h3b,-837;7s,-9j;-jf,6;-ak,h3;gl,-6q;5m,-10'],
            ['3gr4,-7eo;-47,-54;-kl,o2;-5s,gm;9g,0;a0,-m8;b4,-dc'],
            ['3g44,-7m9;-at,-m;-h2,2t;-5t,4a;1r,b1;ic,-4d;92,-5u;4j,-7b'],
            [
                '3f6g,-66s;6j,-8t;16,-5l;-lr,bs;-f8,9z;-af,99;45,2u;cs,-6o;ms,-cs',
            ],
            ['3d90,-5f2;b2,-92;-5j,-1l;-c5,6c;-bf,bf;1g,4n;gl,-br'],
        ],
    ],
    [
        ['Vanuatu', 'Vanuatu', 'VUT', null],
        1,
        [
            ['3l0x,-c9g;hg,-fy;-96,-3o;-9b,c6;11,7g'],
            ['3kp5,-c39;-3z,7o;-l,lb;db,-8k;4i,-me;-7h,3h;-5s,-1i'],
        ],
    ],
    [
        ['Antarctica', 'Antarctica', 'ATA', null],
        1,
        [
            [
                '-11jp,-1o7z;e6,0;15c,60;15w,-60;ya,-bz;bz,-gw;3a,-bz;13,-e5;-170,-8q;-195,-72;-1g8,-6j;-1m8,-5g;-1tu,1m;-10g,99;4w,bg;1nb,7m;ny,99;he,c0;cj,ac;gv,9s;hy,bg;0,0',
            ],
            [
                '-1f5e,-1pxc;1qk,-13;1nv,-2q;ko,bg;ep,9s;su,-bf;-86,-e6;-86,-ci;-1m7,3t;-1q1,-1n;-yu,99;0,13;-f8,86',
            ],
            [
                '-1l18,-1izp;0,0;j2,39;w3,-13;86,e6;1n,ac;-k,mb;fs,d3;pl,4c;ep,-ac;6j,-ac;by,-cj;99,-bz;7n,-cj;39,-ci;-4w,-aw;-7m,-ad;-wn,-3t;-v1,-5g;-10g,k;dm,aw;-wo,-3t;-v0,-3u;-l8,86;-1n,bg;uh,aw',
            ],
            [
                '-26yj,-1jh2;0,0;hf,4w;zd,-3t;149,-26;uh,-3u;uh,3a;gc,-fs;-ls,26;-xq,-13;-ya,13;-11j,-1n;-sb,5g;-ep,bg',
            ],
            [
                '-2mm6,-1ku2;0,0;60,99;x6,-4w;zx,-4d;x7,4x;-fs,-9t;-q4,-73;-12n,27;-rr,9s',
            ],
            ['-2q7n,-1kom;0,0;k5,60;rq,-6j;16g,-aw;-gb,13;-zx,2q;-123,7m'],
            [
                '-3ibl,-1on8;0,0;gv,ad;1fp,-4d;rr,-8q;l8,-9s;7m,-cj;-1hc,-3t;-10g,9t;-gb,9s;-14,1n;-hy,7m',
            ],
            [
                '3uw0,-1td5;0,-42v;-7ps0,0;0,42v;1m,-8;oj,g6;1e2,-8q;38,z;tc,8v;3u,-b;39,-8;147,-bk;z6,bk;6c,1l;29m,4w;qf,-6h;d2,-3b;15w,-99;26w,-73;1qk,-8q;2z7,-6j;27z,7m;3a2,-5g;1ux,-8p;21g,86;259,7m;60,d3;-31d,13;-2hs,6j;-ne,aw;-22j,5z;4w,cj;ac,bf;ac,ad;-5g,bf;-1a8,7n;-l8,9s;-16z,8q;1vg,-1n;1s7,4d;14a,-99;1di,86;19p,ac;mb,99;-9s,bg;-zx,7m;-14t,86;-1l4,1n;-1e2,3t;-1hv,2q;-hz,ac;-zw,8q;-ls,9s;-8p,vl;dm,-2q;p0,-8q;19q,2q;182,3t;mv,-bz;182,2q;110,60;yu,7m;vk,99;15w,2q;-14,ad;-9s,ac;86,9t;zw,4w;gc,-99;16g,5g;w3,73;13q,j;11j,2q;11k,6j;tx,60;xq,5z;ls,-1m;j1,-27;15d,3t;110,-4w;123,k;10g,3t;11j,-2q;15d,-2q;12n,13;149,-k;15c,-j;123,13;sb,86;xq,4d;yu,-60;x6,4w;ty,9t;hy,-8p;9t,-9t;hy,-99;su,86;x7,-ad;11j,-39;w4,-7m;136,1m;zd,4x;15w,-13;11j,-3u;123,-4w;ep,bz;-hy,99;-dm,9t;-zw,26;-fs,ad;-60,ac;-9s,ko;l8,-3t;10g,-1m;zw,1m;wo,-4c;sa,-86;bz,-9t;11j,-1n;zx,3t;123,5g;ya,3a;sa,-6j;110,26;ny,l8;mb,-ci;w4,-4x;yt,2q;mv,-aw;10g,-13;xq,-39;x7,-60;ls,ac;av,9t;rr,-aw;123,2q;sb,-5z;j1,-9a;110,2q;su,60;sa,73;xr,3t;136,39;zd,3u;r7,5z;gc,8q;6j,bz;-3a,bf;-8p,aw;-9s,aw;-8q,aw;-72,9t;-1n,aw;2q,av;d2,ad;aw,bf;4c,aw;-5g,bz;-39,aw;dl,cj;f9,86;hy,ac;j2,8q;mb,85;av,c0;f9,7m;hf,73;qn,1m;hf,8q;jl,5g;mv,39;k4,73;fs,8q;ls,39;gb,-72;-ac,-9a;-sa,-85;-bz,-60;-ko,4d;-mv,-2q;-j1,-6j;-k5,-73;-dm,-86;-3t,-aw;1n,-ac;d2,-99;-j2,-6k;-q4,-26;-f8,-99;-gc,-8p;-he,-c0;-4d,-ac;9s,-bf;ep,-8q;mv,-6j;l8,-8q;bf,-av;5z,-ad;86,-aw;d2,-99;86,-ac;3t,-pl;86,-ac;26,-aw;8q,-aw;-3t,-ep;-f9,-bg;-gb,-99;-110,-3t;-cj,-9t;-gv,-99;-15w,-ac;-110,-4d;-yt,-5z;-11k,-60;-mb,-bf;-18m,-14;-1cz,14;-182,-27;-1as,0;8p,-aw;16g,-4w;v0,-7m;hf,-9t;-v1,-8q;-1bv,2q;-13q,-72;-1n,-bg;-13,-aw;wn,-99;60,-ac;zd,-ad;1mr,-4c;1e2,-7n;13q,-8p;1el,-8q;1x4,-4c;1w0,-7n;1bc,-86;1fp,-99;r7,-d2;dm,-ac;xq,9s;19p,86;1cf,8q;1lo,72;1dj,7n;1x3,j;1w0,-3t;1k2,-6j;hy,bz;12n,86;1y6,k;1iy,5z;1g9,60;1lo,3t;1ph,4w;16z,73;-jl,9t;-bz,9s;0,ad;-1hv,-13;-1l4,-4d;-1if,0;-7m,ac;3t,kp;ci,5z;13q,6j;1at,6k;xq,85;xq,86;p1,aw;123,4x;11k,3t;j1,26;16z,13;14t,3u;ya,5g;xr,6j;ug,6j;12n,8p;oh,99;q5,86;85,aw;-td,6j;9s,bg;ii,8p;su,5g;uh,6k;sa,8p;ls,aw;dm,d2;k4,7n;x7,-1n;dm,-99;x6,-14;14,ad;e5,aw;tx,-2q;73,-ad;x6,-1m;zx,4w;yu,3a;vk,-1n;by,-bg;uh,99;sb,4x;vk,3t;v0,3t;sb,6j;v0,4d;ny,5z;gv,9t;ko,-73;su,3u;k5,-d3;fs,-9s;vk,5g;ci,av;sb,7n;10g,-1n;aw,-ac;mu,ac;ty,3a;wn,13;td,-k;v1,-39;tx,-1n;d2,-99;hy,-86;uh,4w;wn,13;vk,0;v1,k;rr,3t;td,3a;oi,7m;q4,4w;sa,2q;l8,7n;f8,f8;fs,99;su,-4c;aw,-9t;ny,-6j;su,26;jl,-9s;ko,-73;sb,6j;9s,bz;p1,4w;su,99;r8,3u;wn,5g;lr,5z;mv,6j;lr,60;q4,-3a;p1,9t;hz,7m;q4,-j;mu,6j;5g,9t;nf,7m;mu,5g;rr,4d;pl,26;oh,-1n;q4,-2q;mb,-7m;2q,-bz;oh,-99;gw,-7n;x6,-39;ii,-7n;mv,-7m;qn,-1n;mb,5g;ny,bg;q4,-60;r8,-39;q4,-3a;r7,-26;rr,0;mv,-sv;-14,-73;-39,-ci;-qo,-73;-lr,-ac;3t,-aw;v0,j;-3t,-av;-e5,-ad;-d2,-bf;l8,-8q;w3,-2q;w4,4x;f8,av;99,ad;f9,8p;he,86;73,9t;ep,dm;hf,2q;vk,13;rq,3a;sb,4c;dm,aw;85,ad;j2,ac;r7,72;ne,5g;f9,9a;fs,4w;k4,4d;rr,-2q;p1,2q;r8,39;ug,-1m;k5,7m;e5,ii;ac,-7m;d2,-d3;nf,-5f;qn,-27;qo,3a;sb,-27;q4,-j;he,2q;nf,-1n;l7,-60;p1,3t;ty,0;pk,3u;su,-3u;ii,9a;e5,99;j2,7m;yt,kp;hz,-3t;l8,-7n;ih,-9t;ze,-gv;r7,-k;pk,0;ty,3a;tx,3t;mu,7m;j2,86;v0,14;kp,5z;lr,-5g;e5,-8p;jl,-8q;uh,13;j2,-72;x6,-73;yu,-2q;su,26;lr,8q;ii,8p;p1,27;p1,-3t;su,-2q;q4,4c;p1,0;oi,-2q;pk,-2q;p1,4x;tx,4c;sb,14;vk,0;pk,2q;p1,26;7n,dm;13,bf;he,-7m;4x,-cj;99,-bf;bf,-99;ne,-4x;vk,1n;10g,k;p1,1n;10h,0;q4,j;10g,-13;v0,-26;jm,-8q;-5g,-ac;hy,-86;tx,-6j;v1,-73;zw,-4w;11k,-4d;sa,-4d;vk,-k;hz,9a;oh,-7n;l8,-8p;oh,-6j;xr,-2q;w3,-3a;dm,-aw;vk,-6j;l7,-9t;v1,-4c;w3,j;ty,-1n;x6,k;x7,-26;v1,-3t;su,-6k;su,-5g;jl,-86;-3a,-av;-ep,-9t;-ci,-cj;-9t,-9t;-d2,-bf;-10g,-4d;-gc,-9s;-zw,-60;-cj,-aw;-j1,-ac;-k5,-8q;-bf,-bf;-73,-ad;-2q,-ci;k,-ad;fs,-av;5z,-ad;d2,-9t;1fp,-3t;aw,-bz;-1e2,-4c;-16g,-60;-1gs,-13;-ne,-fs;-4w,-d3;-bz,-ac;-ep,-ac;110,-9a;e5,-bf;ny,-ac;xq,-99;12n,-8q;15w,-8p;1ro,-8q;e5,-dm;27z,-5z;5d,-25;kr,-88;24q,73;1rn,-8q;1bv,-6o',
            ],
        ],
    ],
    [
        [
            'Fr. S. Antarctic Lands',
            'French Southern and Antarctic Lands',
            'ATF',
            null,
        ],
        0,
        ['1h6v,-11ip;hx,-8r;q9,-3h;z,-5a;-7s,-cn;-16n,-1t;-p,et;44,bg;1v,5p'],
    ],
];
function p(a) {
    const o = {};
    for (let i = 0; i < K.length; i += 1) if (a[i] != null) o[K[i]] = a[i];
    return o;
}
function r(s) {
    let x = 0,
        y = 0;
    return s
        ? s.split(';').map((v) => {
              const i = v.indexOf(',');
              x += parseInt(v.slice(0, i), 36);
              y += parseInt(v.slice(i + 1), 36);
              return [x / S, y / S];
          })
        : [];
}
function c(t, v) {
    return t ? v.map((g) => g.map(r)) : v.map(r);
}
const worldGeo = {
    type: 'FeatureCollection',
    features: D.map(([a, t, v]) => ({
        type: 'Feature',
        properties: p(a),
        geometry: { type: T[t], coordinates: c(t, v) },
    })),
};
export default worldGeo;
