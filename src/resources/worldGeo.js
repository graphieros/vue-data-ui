/*
 * Generated geographic data for vue-ui-world; do not edit directly.
 * Source: worldGeo.source.js
 * Regenerate: node compress-world.mjs "worldGeo.source.js" "src/resources/worldGeo.js" --precision=3 --keep=name,admin,iso_a3,iso_a3_eh
 * Coordinates: 3 decimal places (scale 1000).
 * Encoding: ring-local coordinate deltas, zigzag signed integers,
 * then five-bit groups stored as printable characters (offset 63).
 * Payload strings contain geographic data only.
 * The decoder reconstructs GeoJSON without evaluating the payload.
 */
const S = 1000;
const K = ['name', 'admin', 'iso_a3', 'iso_a3_eh'];
const T = ['Polygon', 'MultiPolygon'];
const D = [
    [
        ['Costa Rica', 'Costa Rica', 'CRI', null],
        0,
        [
            'bf`D{tQdWpDKdX_LfHjHlFmAhJdDrKhBlKz`@{LtKcLeFyIhAyLhP_NpWgKpTaG`CgQlOeJaCdQnK|MfMkPbScEnGsKI_RiGuRtPyGiMaKmHaGeh@pOkMeGyRfDkIzKmQbC}MgL{N~`@cWbXk\\tY',
        ],
    ],
    [
        ['Nicaragua', 'Nicaragua', 'NIC', null],
        0,
        [
            'nkbDujT|MfLlQcCjI{KxRgDjMdGdh@qOlH`GpTuRf\\gXvLaTjYsRf^g[}EuHiIlHuCmCmRqAyFgMeHQh@w]sMm@aLLoLuOmQrKkEwFqJmFyTeP_@{K_EN_G{MqE{@sIpHqKxAyL}FwN?uTeGuGoGmTf@jD~DdB|LkEzUjMhTvEbX~@pZiBbOs@b[pHbEzDvYiCnOvK~N{AzOqHfI',
        ],
    ],
    [
        ['Haiti', 'Haiti', 'HTI', null],
        0,
        [
            '~`kCcoe@mD~`@vC`WfNnIaOvQf@~Onh@sIn\\hCde@oCd\\tJn`@oRoDcSox@tGen@~CoU{Lp[cZO{Vlf@wHaMgPce@vAgu@zH',
        ],
    ],
    [
        ['Dominican Rep.', 'Dominican Republic', 'DOM', null],
        0,
        [
            'v`kCyfb@g@_P`OwQgNoIwCaWlD_a@yFuIwo@Had@`OmOq@kJdUea@g@~@rQyZfAu]|UdVlXv\\sLt[rApS}AfJjJ~VzBnHeNtS~G~Wvi@bO}HbB}P',
        ],
    ],
    [
        ['El Salvador', 'El Salvador', 'SLV', null],
        0,
        [
            'pomDod[kQfDoLlK{Q`IiAlGmZoFyKnCoGvEhC`X|EtMdc@]nU_EzXmKta@{BvPkL}@eHmTwNwJ}EhBkFsMyB',
        ],
    ],
    [
        ['Guatemala', 'Guatemala', 'GTM', null],
        0,
        [
            'fcsDuk[q@eQgFuMzGsJa]_r@goAEq@gTbIyB|EoLbVmMfV{Sg[E?eb@ky@Ayx@TNnp@zCpeAsQ?kShJmDiHiQ|Fn[zVr\\nPjC~J}CfK|KzNrMxBiBjFvJ|ElTvN|@dH`_@}I|e@c@r[kKr`@yX',
        ],
    ],
    [
        ['Cuba', 'Cuba', 'CUB', null],
        0,
        [
            'vt_Dihl@_u@nCap@Tuy@hT}WzUky@aFcUtM}s@te@{e@d[qS[id@vKpCrPam@pAgn@pXlFtMph@|F`i@`B`j@}ClxAbE{h@{a@nXgOfg@eCrTaQxMqb@hb@lAfy@wOxQcLlpAuHxTeKmVsNh|@eBzk@l_@|XZ|GfN|]zEvY}D_`@iRqLqUg[{L{^eKkn@_EcN{E',
        ],
    ],
    [
        ['Honduras', 'Honduras', 'HND', null],
        0,
        [
            'tkaDgh\\lTg@tGnGtTdGvN?xL|FpKyArIqHpEz@~FzM~DO^zKxTdPpJlFjEvFlQsKnLtO`LMrMl@i@v]dHPxFfMlRpAvIqR~QkDiCaXnGwExKoClZnFhAmGzQaInLmKjQgD}K{N|CgKkC_Ks\\oPo[{VoElAuL}I{P]yDbDuHcBa\\rD{[s@cS{EiF_F}RdB}MfCkOm@kKmDq[tG}Hj@aRtJaQ~LwUpHmOdP',
        ],
    ],
    [
        ['United States of America', 'United States of America', 'USA', null],
        1,
        [
            [
                'n|nFou~AopD?qxD?m|@?o}D?kwD?ozD?szD?ksE?ytEAk`C@E_WcTIcJha@mRpIsj@zBy~@|Hs{@jRsq@cG{kAfOmSS}v@uPsy@tUc|@dWsq@xSoo@~RaElOuMbExBdEwO|@eKmEcBxMqKzHeP?cHrFtFbJc`Ah\\iLvw@oKhu@fQ|c@j\\ja@vLzTj@nE_F|GgTzHuN?qgAk`@m_AyHwpAc^e@iErDaRbIgKg[}Hk|@Gkx@?_SiWyF{CaaA_l@e[oJ}}AMerBAgEmN_ScBqYuHeUm[aRso@un@en@wSlO}h@sIwZ`Q@dtA{g@hb@wInSvaAh]d_ApT~`AnQ``@bd@rI`MRb`@sSb`@}Xp@pEyUwQzL~CzPdi@bI~\\e@fm@zIdZbBhc@`Bbs@bQyzAwJoQxJnvAvQxf@B{@uF`RhPmQzAnL|k@nl@`o@rC_OvLgBnSuN_Lt`@oNbJ]rV~RfWdb@|p@tDoAiRoi@|^{VhF}r@`K~YkLtf@hh@yH_j@bSuAnz@}PhCoErTyGn}@vf@jm@t_ApQ`h@tc@d^~Bt^|U|G~SpcApg@fb@v\\l\\`d@rHjk@_Jjj@{Snt@wZfk@K~Yq\\ngA|@bi@vAhWpNde@tQzFv]qFzHmZvVkMb`@wt@`\\yn@jHmWyKoh@nPka@vo@is@jWqH`~@j[dJcBh]e\\df@mNreAzFnv@}Ern@hCzXvHgJrO^hXgLjKzJdGdVeHnVzJhl@_Atm@_`@nu@xFll@oMze@jCrs@rMzw@hm@b}@~Yba@x\\jMb[Rbj@cB~\\{JfTjWz@jk@wLvo@kRnPk\\vLwj@zc@sb@rTsc@j^yi@~j@{Wbr@d@jf@jp@zr@wQh_@{QpNka@tSs_@dd@oZ|^wRxUeUfkB?BxXpp@?h{BLpmC_k@j}Ak]{DgKjnAxE`fAxCnI}^ng@}b@d\\oFxE}P`b@cBjU{O`y@eE|NcIpFga@t{@y}@~r@{uAeAmMpZuSjo@ks@rG}q@h`@ca@uLyr@dAst@|R{n@mW{y@qFww@sFuw@hJ{rAvRmt@dQ_\\qFgKkyAfTi`@~y@mNoO~Hgr@fTgr@',
            ],
            [
                'ronH_ff@aJlDeIjG}NzTn@nBlWhL~RxHbHlIpN}Gy@oPhIwUaB}E{IeIhCiKsByDwCb@}VpI',
            ],
            ['vtoHwpg@dDnF|SnCxIeLdFaDP}BcEiDgU|DiOpH'],
            ['jdqHqjh@|@vEn`@y@uCsFw]tA'],
            ['pssHili@eD~BaQtSjBrBnCYvTeA|FeMlAoAwOsG'],
            ['jgvHmkj@i@pMlFdE`TkJgBqCqHcEkMh@'],
            ['fcdI_}tBsp@rD}D~Vje@vH|g@uJ|d@_Pu|@uI'],
            ['xgjHafpBoh@fCoYjR`u@t\\l}@xV|^cOtHg\\ww@gUk`@oH'],
            [
                'rjrG_dgC??J~fFJzbJq|@x@{{@hPsj@jZqv@`h@w{@}a@w}@gSe`@h_@ci@rXex@d[cf@xk@{~@hfAgiBvf@w@lf@va@b]????ja@oV`v@}RtPou@poAqq@t`@_z@~z@aCjbBo@fhA_Qf`C{_Axz@{JhlBgUpuAhD|yBw[fiAsYjdAfL{Klj@pa@~BhgA~K~u@bTfdAfL|Gyc@a[i|@maAgRbPsNtnAxa@ri@ph@`yAnk@ul@h]~y@|k@dbAbYp}@`RnNtZp`Bf_@vRj\\bhAtY|i@yChy@lPl~@hT|r@zShjBzPvHoIkcAe\\c|@iRsaAea@olAaFy]sXuuAmd@}LoKcm@aUyIkn@w^}c@`gA|QbSwIz`@vUxg@u^xOjUjVc^n}@~Wje@AjDed@iJ}Ufg@gUfpA~Jvs@i\\vi@_NHmb@bo@sYeW}b@}q@{a@gUa_@sq@qC{i@~Hkq@e]ml@jDqn@kRpJq[~a@gJgm@cWje@VhaArL`RvLfp@wLlwA~EnzA_NfYcXbnAic@{vAcYkjCq]kr@?nGf^}bCmAvq@we@zkAwVlk@g^|z@uYztAwR}a@w_@{mBaA{mAm[{Mm]{~@u\\{{@eFouBwZmx@dCe_Bi`@q}AbLgl@f[wZcKshBvBvBjMs~ArIw~@gEubCvRewBzDco@bGerAeIw}AxQ}bAvG??',
            ],
            ['flnImq{Bse@|J}e@mEoq@nOc}@hGdDxEhn@fLrn@qLvVkJbv@rBzMoDuBqV'],
        ],
    ],
    [
        ['Canada', 'Canada', 'CAN', null],
        1,
        [
            [
                'n|nFou~AjGE~wBk|@tk@_ZdpB{Xxa@iv@}Gke@~nAqY|Imq@rjAkl@h@e_@??wa@c]v@mf@fiBwf@z~@ifAbf@yk@dx@e[bi@sXd`@i_@v}@fSv{@|a@pv@ah@rj@kZz{@iPp|@y@K{bJK_gF??qsB`NmaB`]c`AvD{u@aYujAoR{{ArFs|AoZgeBqN}i@|Xsm@sM_Mm\\ej@tEuhB~v@erAii@mGjn@ykAgIsVgQujArBq~AfYgqC|UauApIe|@_CisAt^|vA~]_pBlLugDkFgt@}IsaAnd@_cAs^x~@qYkg@kTakA{A_q@gEmq@|My}@|`@ydA_DmmBd[_`B}HezAn@fF{e@sv@}Iy_BfTJbz@yf@{p@gq@t@g[y}@|aAqe@|gAgX_DadA{hAkl@mqA`Ig~@pZ{sAneAlv@t]gsBrKH|~@qrA_p@uiAfg@pQjm@m{@bi@g`Acl@ql@_u@mBqcAywAxCk{AdH}rA~]wB~]nm@h`@ak@n`@~Fj]jyBtj@zuAtHr_AyQtQj^d{@ts@fQhZngAhi@lxAbCjp@lYbCrg@tgAxFnkArq@xbAjeAdWhp@nBpgA{zAlIc[ny@g\\ln@mvAkKcsB`Zo}@vVwk@p\\imAdPeaAhYefBrB_cA`EdIbu@mRx}@gl@|dA_|Ajz@co@kSy`@g_Ar_@uaBbk@}_@acBg\\yeAyj@ua@qj@bDyh@li@at@|jAan@whAo`AfZqw@zSs`Boj@mMejB`Pg_A`Ewr@mOey@dT_lAfc@}QfWonBvCz@ns@wS~mAax@vHil@xc@oyAua@yz@_dAih@a\\uo@xv@mpAvnAadA~iAbXff@crAfb@ew@tb@ubBdOcg@zRwW|s@uo@hGcXpVqCdeAjl@nVzk@|T~eBfUrmAhr@thBdItdCeLv|AMv_AhChs@xk@tnAvZdyAtqA|fAtx@ct@gIicBcqAcbCas@o|AgEiv@t]~y@|h@wRjbAmSdn@epAd^gfBaHu}@geAiChl@kg@tUhlA|g@liCdd@~|@fXxdA`l@ln@sClA{s@qkBur@`cB`AldApFzg@ib@AetAvZaQ|h@rIvSmOtn@dn@`Rro@dUl[pYtH~RbBfElNdrB@|}ALd[nJ`aA~k@xFzC~RhWjx@?j|@Ff[|HcIfKsD`Rd@hEvpAb^l_AxHpgAj`@tN?fT{H~E}Gk@oEwL{Tk\\ka@gQ}c@nKiu@hLww@b`Ai\\uFcJbHsFdP?pK{HbByMdKlEvO}@yBeEtMcE`EmOno@_Srq@ySb|@eWry@uU|v@tPlSRzkAgOrq@bGr{@kRx~@}Hrj@{BlRqIbJia@bTHD~Vj`CAxtE@jsE?rzD?nzD?jwD?n}D?l|@?pxD?npD?',
            ],
            ['r`cDi~xBom@y[ytAPh@bKdhAna@bk@m@tL}O'],
            ['~xzCeemCvcAc`@sAoUa]eCanCvEwjBha@qDhPlaA{@jbAi@jcAlGbQyB'],
            ['tz{CkgxBcWwQqXj@{NxKnWz_@rZiDjOsQ}AkC'],
            ['xyuDgmqC~`@fWvyAuCvjAiOg`@c[{xAyOqu@|TyUvR'],
            ['~gvD_lvCn[x@btB_CrOoPy|B\\{j@rJlFbF'],
            ['b~{D{yxCuiAvT|OpUn{AzKzq@oMxYmV|C{X}oAnAmc@bC'],
            [
                'jdkDohpC|cBwF`eDcSrTia@rF_^v}@gZf`CsFlgAkRoVsXy_C|BkdAbSazBE}t@pSfMnVwfAbMuf@zMisAvAezAfDibBqLi~BiDodBjC}aApV_MzX~e@rOd|AlL~nAsFfrDrHh_Cb@',
            ],
            ['~hxEqswCcwAxHxStQnsB~Pt{AeSqq@}RizAkE'],
            ['fvwEg|xCipArKbkAdKxfBA_@}Gc_AuQo`@zA'],
            [
                '~qkBifcBj`@jf@jh@tu@yg@cT_i@jL|TxTmv@bPy[gNi}@fRhRvl@wj@uI}Fd`@mRxe@hY`v@f[hAbh@yJqLcr@jP}FpgAdu@fd@eAck@k\\~z@eNbbAvBhxB{@pHoQ{e@aUdZ}Oos@ud@q_AobBwe@qb@gu@qT_\\vA`K|O',
            ],
            [
                'tybDkd~BmcAlTsfAnRqDt\\_m@yCsk@tSnv@tRf`BaNbb@c[||@f`@|wAj_@nTqc@tsA~Diu@}]_Gep@iTgx@el@bDqJlZ__@sHic@jO',
            ],
            [
                'dzxC_ilCcz@{WuiCr^auAx\\cGfZasBcMc`Axf@{uCtWmu@dXcz@ny@vqBb\\erCxg@gbBtLyxAnx@iaBbClRzj@tlBpgA|kAuYfaBc{@zoAxFzFxb@u`Ajc@{sAv[wXpOug@z|@pT|k@xmA}Ov{Caq@iwAzt@c`Avd@cIxTlhD}WbeCic@vjAm]yTsPf|Ac_@~yAi]]bQtsD|Hzs@mTeh@_m@mtBc@s_C_GzSiUyTe^{oA{{@dPsZbWkTt~Ak]r}BgT_g@yNbaA{e@bv@oBfp@iTl`@lQhpB`GnbF_MdcCiQjdBmH|r@}Ti`Ao[vwAIxRg~@_o@{v@i_AqXk`DsO~l@lg@gp@|e@wx@kq@k}CuXgjBr_AhH|g@szBcQ',
            ],
            ['nqwDmxoCgaCdAkvBdNj|Atv@niAbK`bAtm@hfAiA~e@{u@_@a^s_@qY_}@aP'],
            ['l}nFitsC??aiBwm@k_Cmg@{~AZutAeHpG~n@bo@tTjy@`BdsBvY`cBpHtsAqL'],
            ['jebGophB_{@_DtQ|eAku@hq@|WCrd@s[bVw[p^mRpJoZwB}Rk\\bG'],
            ['f`mEk{yCuyBpG_hDxUyn@t\\iW`Y`eB}EzeBgSbjCiAk{@qQrjAaNnC_W'],
            [
                'jfpF{v}Al^tGreBk[vQeU|v@{TfJyPh_AgJbW_a@mDoMq`ArLke@nHwy@rEgTpT{]t\\k}@xXyXna@',
            ],
            [
                'bklFalpCgxA~Ks~ClBw{@bQabAhYpmAvNfxC|j@nlAvj@?fZncDb]~_@kZhoCa`@yYmYij@ul@eu@ah@b|@ie@grEwH',
            ],
            [
                'tqqEkcsCsv@mIo`AvA_Jp]~d@t\\trEtHt|C`Z`~Al@|FkSy`CuZjyGnFjvAeJgtAa|@yy@oP{nDbTanB~c@elBvCjxAyz@gx@wUo_AfFcTv\\oWfU',
            ],
            [
                't`oEgvmCaeAdXef@|{@kR`k@_hB|]woBr\\vEnZreB~C{f@~V`T|UbpByHnjB{OtgAxBhtBdTj}CjHdnBzDz`@m\\htAaPnv@~E~kAop@qh@uEo_BsIcwAxAqpA{IzwBsMpdC~CrwAi@|_@_V}oC_Xl_BZblBoOms@ym@qj@{WifDae@{~@bKd^f\\ajC{Q}uAp^seA}^ax@nSer@j|@k^{Xjk@a_A_v@cHa}@~H',
            ],
            [
                'jdcEc_mCzcA{g@_iAg]oiAdLonB}FgObQjy@|\\s}A|YfJfw@neBdWd{@eDfj@{VhzCgo@g@_Ss~BvF',
            ],
            ['neoE_wnCwrAoAon@vL~u@fh@n`Bwj@gTwG'],
            [
                'fk_E_ztCwn@|[_Ab_@n[lm@`fBlEdbA_Ii@oc@leBxC~Bio@gbA~@e}AiT{vApByCeG',
            ],
            [
                '~ozDsl|Cij@aRa_AkChZiMipCeBynAj`@ehBjLoeBxJkp@fh@kjAdSztArQlrB~m@pmBnCp`C_GbbAoX]uUmp@sOhqBNzcAySrf@i[kj@wZ',
            ],
            [
                'd{qDk}~C}{A}J_hAaAsyBcI{zAgVolAfBobAnPon@w`@oqA_IaoB}Ea~DqAe`@vEmsDqIkfC|BkfC~BafDzCeeC~FkqB|OvAtOnwCbZdvCtKpw@~LcgCKnrC|d@zdBtPziB`r@|_CjIxf@vKf|DtEeuAxFdj@dJur@x]lz@lTp_BtPr\\lWhvAtQwGdMyiBmAk@fN~eDnd@hbDgPrvDtH~{AqFduBgBxF_]qrBcMx]cl@ce@kCcfD|YftAag@jdB_Ksq@eWymB{MwPwTfwAmWpYe_@{iDtAip@vEq`BwUvkCgFtyE~BnmBgT`s@gX~gAiQtLiT',
            ],
            ['~{qCgvbCrg@lQ`eAbBpNq]oYab@ix@sGyo@hPUvY`FrG'],
            ['`_{DcvfCae@zVze@|TdsA}Q|q@xEhtAa[_v@kRuj@cZiaAvPod@fJwQzJ'],
            ['l_}Bal`BsTgDeqAtN{~@`Y{@nJl]b@~oAsRby@o\\'],
            ['|_|BwzzA}Tj]il@jG}x@u@v]rXbV`ChnAqYrN{SsViR'],
        ],
    ],
    [
        ['Mexico', 'Mexico', 'MEX', null],
        0,
        [
            'nwcFmp~@afAyCknAyEzDfKk}Aj]qmC~j@i{BMqp@?CyXgkB?yUdU}^vRed@nZuSr_@qNja@i_@zQ{r@vQkf@kp@cr@e@_k@zWk^xi@sTrc@{c@rb@wLvj@oPj\\wo@jRkk@vLkW{@fWzu@|I~k@pCtrA~Dp]yI`a@kRn]oKno@mh@nm@sMtb@mWv]kaApOyXdYyu@oPun@iEym@gJif@uIwf@oX{Mmc@eDqs@wIgQki@kOaaAoMkv@dA{d@iD_NfLbAb]p`@dd@zM~d@oJ|IjH~YrNvo@zNaO`L`@zJXjUvd@jJmFpF|AOdHxx@Ujy@@?db@f[DgVzScVlM}EnLcIxBp@fTfoAD`]~q@{GrJfFtMp@dQteAgbAf_@iS`r@iOza@pCdq@nVn^bEdk@mOxm@{Jly@u[xm@wGveAa\\hs@{\\xNuO|a@wB|~@wR`Yq[bbAmb@h^mf@zMm]yScElEyPkMeOIsT`Ta[rD{W~Sq^`v@c}@x}@yo@l]}e@rt@qXnJgNoHse@x^qM|c@k]pNsj@r`@aDhc@}_@f\\k]vAqRr`@cn@bU{n@]_Wdl@yWzSvArb@gP`IlXkI|\\aE|m@mTxXkm@~i@iIvMoHlCgGnTcJ[oKhg@_RzNiLbUif@x^uSby@qQjZkPh\\mB|_@c]`AaXl[uUzZn@dJhY~U`JInO_e@|g@sb@`l@e]|^{NaAwl@nH{`@v\\kR~i@{ZfG`GvNiOpe@cNxc@ic@qCuCwXpBeVkViAe[bo@qk@tc@iP~Uaf@dV}g@~[_q@jXew@',
        ],
    ],
    [
        ['Belize', 'Belize', 'BLZ', null],
        0,
        [
            'lbmD_xa@NeHqF}AkJlFkUwd@{JYGdHyJF^~ObI`ZmDtHpEhU}B~DdFp^hKrOfJ|@lKtTrQ?{CqeAOop@',
        ],
    ],
    [
        ['Panama', 'Panama', 'PAN', null],
        0,
        [
            'pavC}|OrFdHoMxc@vJpQbSoC`Gj]xS_QjLw`@mNuOxNiCtJsSb^kPjZ~BtKtTdXvNtLdAbE~Ky\\z`@`P~F~GfH`\\dBzIid@bGrIrSuBpKcXrXcCfOiFxY@|@pLdFmHiBmKeDsKlAiJkHmF~KgHJeXeWqDmUlUh@dL}WxA}DaDePjNw]qCqYwN}d@sKkTuQoa@tBhAbEya@dAyZvIkSxQqVfP',
        ],
    ],
    [
        ['Greenland', 'Greenland', 'GRL', null],
        0,
        [
            'vizAgk`D{pEid@gzExAwnAaV{{E_EgrNxF}eKpp@lrB`WbnFvAjoIbEo^bJe|E{Ei{DpTixBcR}r@lUrcAhc@c~CgVonHeWkzD`Kab@tYv}Fnk@hb@jMvfExIwoC~AbhApl@hq@pg@}@ndAajAxg@r`BrAveBvRirBb`@uMbt@xaAvD}oAvt@xiCnCmgAlXlS`UbwArHbvADimAji@YxZrzB{Xd_@vOksArN{pAde@uVhq@jnB`Kdo@aWflA}b@kTli@rgAz_@wcDrAcuAlBnfDju@zhDhp@|uDpT|cAFr_AbW|uA|`AleCxj@dj@pAdrAjNxxArMpt@re@Zxj@r^`h@zdB~p@cXxo@`[tr@~^~{@`wAxBh{A_r@|{BIr{@ia@th@_|@hkBwlAt^ug@pGew@puAux@oUam@th@_Uy|@ahAa}AgVuWcYaLyo@lfAbU~`@hHbw@zGtkAkSdCmi@mWg`@_y@]q~BrOljBuf@|v@kTf}@vGds@mNydAgy@~d@iVrp@ej@fjAgaApnAiWWcYvfDqc@tcCqC~eDnAnwCrCpgA}RrkBif@ccDsRy|BiBljGgOzkCoXsGiWskFa]{cF_]eWwUtgDmUou@}WkwEsj@}yAuE`Ya[asCoOe_EyHa_EQecAnRwdDma@etCjVwvA|Cy`ChSrsCu`@qGwY',
        ],
    ],
    [
        ['Bahamas', 'The Bahamas', 'BHS', null],
        1,
        [
            ['fgyCkis@k\\_Dgh@z@{@fObcA~HjCcV'],
            ['z|vC_ys@kp@b[xIlk@lJ_G_@u_@~ZuWBeF'],
            ['|uwCsfp@yQnA{Tzr@Ifc@hNbBzN_c@jVcQqLsf@'],
        ],
    ],
    [
        ['Trinidad and Tobago', 'Trinidad and Tobago', 'TTO', null],
        0,
        ['~mwBo_T}b@cGcLdAnApm@ds@zEfJsDcQePf@uW'],
    ],
    [
        ['Puerto Rico', 'Puerto Rico', 'PRI', null],
        0,
        ['rm`Cedc@}^nDgJlK~NvN`n@Knc@dArBuYyGeHer@J'],
    ],
    [
        ['Jamaica', 'Jamaica', 'JAM', null],
        0,
        ['bovCubc@ai@rDg`@~MiIbP|j@d@|QlI~a@aIvb@wUoFiMiYiCeM`A'],
    ],
    [
        ['Indonesia', 'Indonesia', 'IDN', null],
        1,
        [
            [
                'okrGnaDa@tjEa@tjEtv@ir@l~@qKlNxPdnA|@qY{q@kf@kPhO}bA~\\os@dxB{s@nr@gDz|Awx@lQj]~VnDdM}UDcZvn@u]ibAqUqk@f@fDqOnzACvWgd@xv@oJlY}]gsAeN__@iSkcBrXyHfVoP`dBu_Ald@es@iaAwfAud@qv@Amt@vTkm@jUabA|J',
            ],
            ['qasFxjPiEhKe@|Qxg@tm@nt@vLnFoFsDgT{Yce@y|@yW'],
            ['cceG|mL`Ean@aJmUcLcTeMhQBv\\d_@pi@'],
            [
                'sfeFsaGpb@nw@}l@bz@vIv[aeAzx@`iAjFzSri@wArw@b{@vi@r@f}@bWp~AdHgU~eAb[vWee@pk@qBd^_ShiAlUxUg]|g@lBnr@eFpHyrAd^kP~\\mt@tGuu@gF}x@cd@oh@mIvh@wi@hb@ig@uK}f@nCkc@s^_]oDcz@nP}q@iLa_@{uAaWwTuTcfAyfA@eu@nI',
            ],
            ['ut{FbnDwcAfQwUvn@vs@wXfs@eDfb@bCfj@gAyMia@elAsA'],
            ['uxvF|kFdj@oJdK{Yg~@_BoNrSjVvS'],
            [
                'wzxF}fCoCba@}c@nDyDpXfBru@f_@cEnH~d@wX~_@nPnFfXqf@pQ}nAsK}p@uSwU',
            ],
            [
                '_boFuu@{fAsAw|@kl@}I|Lfq@~|@|m@~Jd{@eKbgBbBru@~GzGhn@}v@pv@w`@i[qsBgTdDv[dZaHbZrc@`v@dWez@boAlJnTew@bgAP`h@h`@jQpW_Ug]er@j|@dWpNgPcGeW`l@sc@sC{{@th@~QiDzgAqAjxArf@`HzYiQ}Pqx@tHi{@hYMjRyi@yX}g@{Gsp@m^e}AcLwXct@mm@yo@lQymAtG',
            ],
            ['m}iFd`S|qAyj@gy@iK{_@`R{T~QvBzOhYd@'],
            ['{~kFptOqh@wCaw@}UdHva@||AvPbrAwFDyUsp@_Lef@vQ'],
            ['i~eFriOqe@aDqNpYhgApKfj@jGr`@OoT_c@ga@OwOaUqUrO'],
            [
                'm{rEjpKoGfUwvBdEyLwX}rB`]wUng@w|AlJukAbd@hfAxVvcAeXpw@t@z_AsCny@eJjgA{Vzl@eE~XxF~pBwXxI{Yfx@sC}i@uz@yjAtBmq@lW}XvC',
            ],
            [
                'czjExbAqIpj@yTza@{l@pDm]pf@vNvlAlAr_BfdAh@rs@gs@foAar@vY{d@hn@{q@~]{m@pn@ovAzu@as@jQwt@`Vyo@hw@if@t_@ot@`n@_b@d`A{cAnDy^gg@nAw_BbKgv@b|@ko@ji@ma@~Xez@dbAq~@\\os@xi@ec@js@qn@n[~W`r@yb@tTmUr@',
            ],
        ],
    ],
    [
        ['Malaysia', 'Malaysia', 'MYS', null],
        1,
        [
            [
                'knbE_sK{IeJ_r@jZ{Cb_@gh@oFmSuXkMzD}c@vd@eYxh@sB`i@tEl[aEnTqC~c@aUfPqWfv@d@bThk@dCbz@im@|hAsp@hFy^dc@yh@rGwr@nUaa@yEql@vLmY',
            ],
            [
                'sfeFsaGdu@oIxfAAtTbfA`WvT`_@zuA|q@hLbz@oP~\\nDjc@r^|f@oChg@tKvi@ib@lIwh@yl@jTio@uJqK{s@uYyJ}iAoLyk@op@u]of@o[j_@cLgTy\\|@uB{f@yAy]co@mj@o^{o@iXEa_@r^{AdZeh@jPcs@xQlCnW|h@`BcJp]~l@fT',
            ],
        ],
    ],
    [
        ['Cyprus', 'Cyprus', 'CYP', null],
        0,
        ['w|~@gscAwJfB}OiDaKRoCzBg@hEcBmAiHh@}JwCwEdA}@`D`_AjXr]cGpMaXu\\iA'],
    ],
    [
        ['India', 'India', 'IND', null],
        0,
        [
            '}a}Dkev@wCtV|TnJcDle@tk@iJzoAdj@{@xb@na@ls@bBl]zZnr@zo@gMlAt_AbMhTsEpYx]xM|_@cbBfPDfI|f@da@m_@iRqb@}ZqBy[}s@~b@sI~x@Zlz@qGpDmj@x\\aBnp@aZ`Uli@cl@``@bf@hVzLvUoe@vOrItd@sT~m@wHlr@|GxUpi@W~kA|KqB`n@j`@|c@|xA`i@|dAphA~m@lf@f}@zg@Bv[b^lNhw@jUd\\hBvQtn@_LfpAiBzr@lYjz@HdiBh_@~An[tn@aRpS~w@vP`Tni@`X|Pdz@iy@|[qvA~V_~@zTq\\d`@a{@nNemAxI_f@zw@{tAzXcxBtQ}nAEwjA`Koy@~yAld@`k@oFrpAwjAa]sUlQoWhhAat@sh@uh@ohCBjKst@bb@u^bFco@|g@a[{cAo`AsgAvCk`Aq`Aef@k~@s{@w}@\\qk@it@cc@lq@{]vTgi@bUyu@s]}Yy}AfNudAiHi{@os@ebAfhAhE~q@{W~^`Az^zk@kGqPzcAk|@pf@{uAvj@rf@h[hWny@q{@rV}y@t]opA~a@utAbGac@x^go@|DejApMas@a@eFuWfGwf@yC}Yce@cLgDfp@k@nKyw@vVgf@yHys@dC}q@y@mCme@lX}Rkq@yF{w@om@agAwf@ms@hNqk@iYi\\ze@bTfYkbAhH',
        ],
    ],
    [
        ['China', 'China', 'CHN', null],
        1,
        [
            ['eytEkpb@fr@kRx@wt@y]i[icAoP}b@l@}LzVlZnZnMbc@~t@~\\'],
            [
                'gw{C{uqA~Csb@{i@gOfw@skByzB}W__@}Lal@{nB_{BpSwa@g[_Bu}@}r@yDqn@sh@mWcDmOrj@os@b`@exAlVcj@jq@`W~gAoUbZgiAtIesAvGojA|e@se@|Em[rx@uc@`d@}cAm@_`C~LcrAuGu|@hHm{A~d@sjAAuZlRwgAq`@_dBwTu|AiA_hA_U{k@o`@wj@_TbIsS~R_Wy_@ig@eb@rDg_AtKg}@e`@i~AeWyl@ih@_k@yPwyAgGip@~E{EeUrw@uj@dq@_S~n@`Vt|@uHjb@zFbOoXek@o}@m]cn@_jArVawAof@PoZmw@iaAwa@_SVoa@ha@{Msr@a^ulAiJyqAu@q|ArQ{u@~Use@`~@mVzYwTje@cVf|@ykB|R_iAlk@iXvy@_~A@eu@sWgfBmQx_@fw@hWzUjTlcA`i@x{@zjAaJrt@`UoOnt@~GzhA|^t@Kv^jg@{c@xW~a@p_B|YwH|_@~t@gAt\\sR|i@jk@zcAp`@zq@bg@jvAbQ`m@f\\fbA`Pe`@_\\`LiWop@_i@``@w_@lu@`UpeAlj@pe@jg@f|@~Az^b\\}_@hi@cr@fIcA`[mp@fQ_eAsk@ov@hWmg@t@cIt_@nwAnPd\\v`@v{@h^b_@vj@ibAja@oWl|@ae@hx@mi@~n@^lm@ff@`P_Nh`@wc@jRrH|q@zNnp@za@rDtl@tbArq@~pA~x@riA|tArx@|uArs@leAdFde@vZrTgSjb@`^hvAh^daApHhT~`Ara@tBjOkl@wMeWxrA_Sp\\dI|}@gOv\\kX{H_c@bx@mJb]mVft@h`@v{@dFzp@Ip`@fNj_@dHmHnfAh`@w@rDuMz@yXxl@dQbZoJjm@mVeQ}r@pf@cK|Mox@|`AjIoFeiAez@es@oAqr@x@yn@hZ{MzSyc@pc@rCjbAiHcTgYh\\{e@pk@hYls@iN`gAvf@zw@nm@jq@xFjZyO~_@o@tk@mMv`@xNjh@nm@fDgp@be@bLxgAaEveAkMtq@mZpo@iK~S_]bb@_H`~@ug@bq@gR|X~MzuAwj@j|@qf@pP{cA{k@jGaA{^zW__@iE_r@dbAghAveBgXnQao@dm@c\\bJ}PjHsb@eAiW|d@gMpShEzNyx@yPiMrGsMuz@o\\ej@gKcaAjGsV{f@eoAmFiUyWmaB{`@yGcM',
            ],
        ],
    ],
    [
        ['Israel', 'Israel', 'ISR', null],
        0,
        [
            'owdAi{~@zItRrUuG`Lrh@uN`F|NpGvAnOm\\oGm@hWb^|bBfEgOza@czA????eQsSfCqBqOe\\sKcn@}G{Nw@S}SBwD}IwOY]pXlGnHe@L',
        ],
    ],
    [
        ['Palestine', 'Palestine', 'PSE', null],
        0,
        ['kcdAao|@l\\nGwAoO}NqGtNaFaLsh@sUtG@de@dHjQ'],
    ],
    [
        ['Lebanon', 'Lebanon', 'LBN', null],
        0,
        ['y}dAy~_AvOXvD|I|SCgU{q@c^ak@c@eAc[dBgInWba@pVhNfa@'],
    ],
    [
        ['Syria', 'Syria', 'SYR', null],
        0,
        [
            'owdAi{~@d@MmGoH\\qXiNga@ca@qVfIoWb[eBxDyn@iNwXwOuLuOuLkB{a@oSdKycAkPg`@vJmr@E{fAmVu`@`@cfAwH`_@~e@da@lN{Dtl@rVpjAjiC~_AjyBraArdAwW',
        ],
    ],
    [
        ['South Korea', 'South Korea', 'KOR', null],
        0,
        [
            '}luFkvhA{BsD}ZdAiWe[ek@aBsYaC_HcN}t@vhAmNng@O~fApVja@pw@~J|p@zXhw@jD~Eaa@qJ{m@rZ_`Amm@qIxi@ot@',
        ],
    ],
    [
        ['North Korea', 'North Korea', 'PRK', null],
        1,
        [
            ['wl~FwmqA??????'],
            [
                '_d~FuxqA??wG|IvVwBbZdTtQfTkAzk@h_@xLbJ`JpVlQrh@hIbZvO|@`ZhF|E{WbImb@lZ~GbNrY`Cdk@`BhWd[|ZeAzBrDj]{JpFvJhQdDdAwJdOwDxO}HcPoZwMkFpDmJ{Nu`@bCeInc@yEl\\wO{q@cg@{cAq`@}i@kk@u\\rR_u@fAvH}_@q_B}YyW_b@kg@zc@',
            ],
        ],
    ],
    [
        ['Bhutan', 'Bhutan', 'BTN', null],
        0,
        ['abrDwfu@mX|RlCle@|q@x@xs@eCff@xHxw@wVj@oKkh@om@w`@yNuk@lM_`@n@kZxO'],
    ],
    [
        ['Oman', 'Oman', 'OMN', null],
        1,
        [
            [
                'oyjBgjk@s@eXgQ{XEqXg[iK`JuGcDug@}^G_[ti@{a@tU{l@dG_d@jJg[zb@yOvSkUzFB|LvUfd@~HpPhY~RhVxi@j[gB~KzM~Ht^uFvh@|DtFv[E~e@jVbEl]fMdL|e@OlWvNIfXf]hPna@{Dvh@`Tz[pBlSuj@zo@cfBozDo}@uh@_|Bt[gk@',
            ],
            ['i{lBefq@zJgTeQiTwFlD|DxXbGhJ'],
        ],
    ],
    [
        ['Uzbekistan', 'Uzbekistan', 'UZB', null],
        0,
        [
            '_ilBytoAlAmeF{_D}c@uJlD{_Bvk@cr@rVuz@jw@ihAcHejB{CyiArl@tCt}@o]LuKfr@onA~@cPr\\gVMkZuk@mqAqj@yb@qJqQbEls@ng@cm@nVok@qNaiA|_@~nA~k@pn@cExXp@|GiPaL_\\rrAnMxRbg@v\\pa@ds@}AdOnZ{l@zMoLpm@bb@f~@bn@eLxa@Mu@ge@brAwYj`Aq]vg@m\\nfAej@t]m_A~SiJpbAzA|VyKtE{p@dsAa`@rs@hc@lt@pTgIn^neAX',
        ],
    ],
    [
        ['Kazakhstan', 'Kazakhstan', 'KAZ', null],
        0,
        [
            '_siD}b_Bpn@rh@|r@xD~At}@va@f[~zBqS`l@znB~^|LxzB|Wgw@rkBzi@fO_Drb@ne@eHj^mUv{AqErfBu@tUzE~wAgYnb@|KtHzc@xeBoTdh@xG~LjZxb@pJlqApj@jZtk@fVLbPs\\nnA_AtKgr@n]MuCu}@xiAsl@djBzChhAbHtz@kw@br@sVz_Bwk@tJmDz_D|c@mAleF`_@`Bvj@_p@fi@oP|eA~KrZxSnBgNkNaY|JwTlgAiTd[cw@na@yN`AkSy{@|DkAul@ct@cIsu@hHgJ_|@bJse@p}@~Abt@gNjgAnZhy@bLv^cIkEe_@zf@wh@jm@v@`t@ki@cc@kn@fQwKyp@ucAi_Afc@wFsl@a`C_cAs`Bs@whChj@_iAfXiaAkYabBg@}nAl_@eQqQwvAtAuNs\\fdB}i@}z@o]tJ_P_{@gObl@yi@u[iT{hFwTo]mNk{CaVew@}XioBlLuRx_Ag`AgNioAhTdDba@}z@qBs{C_z@zUrRwnAho@ujCt}Cg`@u_@cuA~b@yxAaOoa@fJa]bc@wj@bKqYnYooAkGe`@fe@',
        ],
    ],
    [
        ['Tajikistan', 'Tajikistan', 'TJK', null],
        0,
        [
            'kncCqpgAcb@g~@nLqm@zl@{MeOoZes@|Aw\\qa@yRcg@srAoM`L~[}GhPyXq@zUfR~bAmI|D~b@wbAyCglAhScuBoH{Nxx@qSiE}d@fMdAhWkHrb@l_AC`j@qC|e@|ZvZfEvTbLvWoSyDos@|Q}AyEcRx`@eM|YvTpEdXrHdHjd@i@dSr[`TaKdl@`SbRsF',
        ],
    ],
    [
        ['Mongolia', 'Mongolia', 'MNG', null],
        0,
        [
            'mkjDah_B}`A{IgvByt@a~Ak\\iu@dRg`AZwh@f\\k}@fAkyAtNw{@oj@jXyc@u_Aw_AaeAxXuw@hFohA`O}Jxm@ywAhYaz@qJanAeGs}@fGe|@~\\}d@|^}x@SwmAdImx@oNiqAkIozA_k@od@vEw_@|SqiAgDl]bn@dk@n}@cOnXkb@{Fu|@tH_o@aVeq@~Rsw@tj@zEdUhp@_FvyAfG~j@xPxl@hh@h~AdWf}@d`@f_AuKdb@sDx_@hg@_S~VcIrSvj@~Szk@n`@~gA~Tt|AhA~cBvTvgAp`@tZmRrjA@l{A_e@t|@iHbrAtG~_C_M|cAl@tc@ad@l[sx@re@}EnjA}e@dsAwGfiAuInUcZaW_hAbj@kq@dxAmVns@c`@lOsj@',
        ],
    ],
    [
        ['Vietnam', 'Vietnam', 'VNM', null],
        0,
        [
            '{wjEmnScu@cXs`AqClZ{d@_hBao@wF}iAnMsh@kJo}@vNek@hn@mj@jf@av@|r@{hAziAkd@{PoU_g@kOfWou@|kAO`[ww@pc@kp@q`@gN{p@Hw{@eFgt@i`@c]lVcx@lJzH~b@w\\jX}}@fOlrAlt@`s@`z@vLjj@yn@z`Amy@tpAuw@pe@_e@dq@s[trBlG|lBbs@dh@pfAfg@~q@`s@|lAdy@tUag@qPii@jm@qb@',
        ],
    ],
    [
        ['Cambodia', 'Cambodia', 'KHM', null],
        0,
        [
            'qjgEuxVxMmjA_g@_s@yoA}Jsy@~Gqr@nWg[cj@mv@`VoMrh@vF|iA~gB`o@mZzd@r`ApCbu@bXhs@cHjXq_@r^q_A',
        ],
    ],
    [
        ['United Arab Emirates', 'United Arab Emirates', 'ARE', null],
        0,
        [
            'wvcBijn@aJaBiAbP}o@yHur@r@wd@x@yi@gi@sm@ag@of@oe@{JfToGjp@|^FbDtg@aJtGf[hKDpXfQzXr@dXpKdLzzDo^|Vi~@jAmM',
        ],
    ],
    [
        ['Georgia', 'Georgia', 'GEO', null],
        0,
        [
            'e`mAuysAsFkFys@tI_{AbIctA|\\}IrJ}d@yHgy@`LcRtXif@lMfOrGy]x`@nGjFt`@wBrm@}PhNdIxuAvHd{@u]raA|AiHuYrNsi@bc@aVra@eFzUcR',
        ],
    ],
    [
        ['Azerbaijan', 'Azerbaijan', 'AZE', null],
        1,
        [
            [
                'isyAiwpAqPbA}i@|d@uZhCuI}Nid@eX{_@|_@y^hk@c\\|AgRxOnr@`DzIpo@vIzTzUrMs@|]pNbB|e@w_@qT}]nQiQlVrCthA`m@l@ij@~ZgIpY_PsP{Rh`@oTqKsNxVyI|KmOiNeIsm@|Pu`@vBoGkFx]y`@gOsG',
            ],
            ['_cyAitjAzi@iGp^{[|HqV_Lu@oQvOsZCHrHqXdc@'],
        ],
    ],
    [
        ['Turkey', 'Turkey', 'TUR', null],
        1,
        [
            [
                'imvAcrgA~\\nI|T{NtgAaGxYtHbfAvHt`@a@zfAlVlr@Df`@wJxcAjPnSeKjBza@tOtLvOtL~Ui[uVoVbe@jDfs@mM~i@~b@z}A~Epq@o`@jbAcAlM|Xdj@lFl{@i`@fcAb@~c@c}@tl@ua@m]so@rf@{\\idAwz@g_BoAgYon@cvBfGcjAog@ygAuPmfBi@alB`k@uxAbWygAsHwt@pDyhAs_@saA}Ae{@t]sI~T`Ej]om@pNsWfQxi@xPoRtfAdKhRea@bq@??',
            ],
            [
                'i_r@eupAu~@sRyt@jGmF~Vou@dSjJhNdiAlBtYhRbs@t`@tRc\\[{K{M_FiRcf@l]qO',
            ],
        ],
    ],
    [
        ['Laos', 'Laos', 'LAO', null],
        0,
        [
            'mvpEsvZlv@aVf[bj@pr@oWiSe[yA{s@rq@ou@zBu|@pn@wq@fn@iCpKvTrc@x@tQ_Jz`Ahd@n@aw@kN{`Afi@yApBqd@`ZiRiL_Vet@ug@sDtMi`@v@lHofAk_@eHqc@jp@a[vw@}kANgWnu@~f@jOzPnU{iAjd@}r@zhAkf@`v@in@lj@wNdk@jJn}@',
        ],
    ],
    [
        ['Kyrgyzstan', 'Kyrgyzstan', 'KGZ', null],
        0,
        [
            'criCspqA_MkZeh@yGyeBnTuH{c@ob@}K_xAfYuU{EsfBt@w{ApEk^lUoe@dHxGbMlaBz`@hUxWdoAlFrVzf@baAkGdj@fKtz@n\\sGrMxPhMbuBnHflAiSvbAxC}D_c@_cAlI{UgRqn@bE_oA_l@`iA}_@nk@pNbm@oVms@og@pQcE',
        ],
    ],
    [
        ['Armenia', 'Armenia', 'ARM', null],
        0,
        [
            'syyAevjArUz@pXec@IsHrZBnQwO~Kt@rWgQnm@qNaEk]rI_UyuAwH}KlOyVxIpKrNi`@nTrPzRqY~O_[fIm@hj@',
        ],
    ],
    [
        ['Iraq', 'Iraq', 'IRQ', null],
        0,
        [
            'upkAay}@dXckAkiC_`AsVqjAzDul@ea@mNa_@_f@yYuHugA`G}TzN_]oIog@niA}g@xQwCnc@n^pTlMvo@gj@lz@skAfa@c_@nn@fIfl@_S?Sh`@qa@x_@`d@aB~h@eDzl@~z@fsB_DdoDu|Bb|Awj@hjA}O',
        ],
    ],
    [
        ['Iran', 'Iran', 'IRN', null],
        0,
        [
            'oz}Ammy@pa@y_@Ri`@~R?gIgl@b_@on@rkAga@fj@mz@mMwo@o^qTvCoc@|g@yQng@oiA??da@cq@eKiRnRufAyi@yP}HpVq^z[{i@hGsU{@uhAam@mVsCoQhQpT|]}e@v_@qNcByR`m@gz@~Kkj@j^{wAxIs`BqO_EsM{u@aKok@wb@wh@x@mZsJmk@vDcdAt^}p@xEmfAjv@qm@dAoDrs@nXzlAdPnl@gZdHvYfa@oSzp@{Ctf@in@nIcDfg@tw@tw@}]z_@eXvd@wz@lZu@`v@}\\bIeDv[dyAh_@pVrgAptB{QbcAkMpeAcGrYskA|\\aJ~n@bJ`~@f]jkAuS`~@ao@d{@yPvh@iz@bm@irAr`@bIvf@uShVjW',
        ],
    ],
    [
        ['Qatar', 'Qatar', 'QAT', null],
        0,
        ['sfbBejo@bCml@yOy_@aPwE}QrRc@pc@pLxc@jPlCzQmK'],
    ],
    [
        ['Saudi Arabia', 'Saudi Arabia', 'SAU', null],
        0,
        [
            'wgcAyix@qdA~H_ZgR_NoUun@uGgI}SuSqIh}@o}@e|Bk^{JmHijA|Oc|Avj@eoDt|BgsB~Cuv@~DqNx\\ek@s@oWzt@w]hMuI|Tqi@fYyBxXfExS}F~S}PnPkGnSiHhN{QlKkPmC{JzVkAlM}Vh~@{zDn^qKeLu[fk@th@~{BnzDn}@dsD|Vjy@b[vk@r`Ad\\lIrNyS|VbBl{@gElJgEbgAl@|OrDtXgOpOv]kEhYlZ|R`GuYzQyQxC}Wh_@kUh`@ms@rP{q@dj@aj@zZgIlh@qz@dFmj@sAad@xb@gdAh\\mWv`@{KpSyb@kBeMhPk_@fQ}LlWom@`e@mq@z^{i@b^FwHga@wA{TwF_X',
        ],
    ],
    [
        ['Pakistan', 'Pakistan', 'PAK', null],
        0,
        [
            'y_wCkidAh{@ns@tdAhHx}AgNr]|YcUxu@wTfi@mq@z]ht@bc@]pk@r{@v}@df@j~@j`Ap`ArgAwCzcAn`A}g@`[cFbo@cb@t^kKrt@nhCCrh@th@xl@yNtQ}k@fo@qn@drBvJndBd@`wAvGqVsgAeyAi_@dDw[|\\cIt@av@vz@mZdXwd@|]{_@wgBz^o}@iHkd@|FsKuLqj@nDepA_YeAet@{a@kb@om@B{EoPwn@cGcVxDmWqPlBqd@oYud@yf@{NpWih@mz@|@ePoUrA_Wc^gYbFc^xMmYoc@gZcbAcLwfAgFw^qJkc@_Fem@b\\oQ`o@weBfX',
        ],
    ],
    [
        ['Thailand', 'Thailand', 'THA', null],
        0,
        [
            'eolEa{Zry@_HxoA|J~f@~r@yMljAbw@u[lt@d@cHcp@~u@J|CvcAv`@hzAhSdv@gCfl@wg@|@kX`x@eJ`u@{a@xb@{d@fFk_@l_@lStXfh@nFzCc_@~q@kZzIdJtW_WtI}]f`@ib@f]s\\fItc@zJua@yE_f@mQ}z@g]g_Aia@gy@lW_x@_@_\\bF}a@th@sp@|Mk^qToJ{Uku@pXgh@tf@sl@d]yu@kYkJo[qbAck@yAmc@cZyb@mMaZhRqBpd@gi@xAjNz`Ao@`w@{`Aid@uQ~Isc@y@qKwTgn@hCqn@vq@{Bt|@sq@nu@xAzs@hSd[',
        ],
    ],
    [
        ['Kuwait', 'Kuwait', 'KWT', null],
        0,
        ['mu|Aopy@_LrZpDfMcSbn@dk@r@pNy\\tv@_E{l@_{@_i@dD'],
    ],
    [
        ['Timor-Leste', 'East Timor', 'TLS', null],
        0,
        ['qasFxjPiFwMyt@aMsj@cAoRyFuVvF~U|Ob`AjZhs@|Pd@}QhEiK'],
    ],
    [
        ['Brunei', 'Brunei', 'BRN', null],
        0,
        ['un`FosIxAx]tBzf@x\\}@bLfTn[k_@wWkVet@ga@'],
    ],
    [
        ['Myanmar', 'Myanmar', 'MMR', null],
        0,
        [
            'gpbEc{f@xb@lMlc@bZbk@xAn[pbAjYjJe]xu@uf@rl@qXfh@zUju@pTnJ}Mj^uh@rp@cF|a@^~[mW~w@ha@fy@f]f_A`Ekm@gR{n@`T_d@cDacAjXk_@jSyiAhJ_nA~Ywr@dh@j^`fApk@`b@qDte@uMoTmlA~Kqy@~o@_gAsFqUpc@_Ghk@_r@bCgq@yTlHi@yk@y]yMrEqYcMiTmAu_A{o@fM{Zor@cBm]oa@ms@z@yb@{oAej@uk@hJbDme@}ToJvCuVqc@sC{Sxc@iZzMy@xn@nApr@dz@ds@nFdiA}`AkI}Mnx@qf@bKdQ|r@km@lVcZnJyl@eQ{@xXdt@tg@hL~U',
        ],
    ],
    [
        ['Bangladesh', 'Bangladesh', 'BGD', null],
        0,
        [
            'a_tDq`j@h@xk@xTmHcCfq@zPq_@rB{^zJa]bYkc@px@oAuDvXrRxa@rYuK`HjJtPyEdWsDvHmr@rT_n@sIud@ne@wO{LwUcf@iVbl@a`@aUmi@op@`Zy\\`BqDlj@mz@pG_y@[_c@rIx[|s@|ZpBhRpb@ea@l_@gI}f@gPE}_@bbB',
        ],
    ],
    [
        ['Afghanistan', 'Afghanistan', 'AFG', null],
        0,
        [
            'm|`Ce~gAya@Lcn@dLcRrFel@aSaT`KeSs[kd@h@sHeHqEeX}YwTy`@dMxEbR}Q|AxDns@wWnSwTcLwZgE}e@}Zaj@pCm_ABcJ|Pjc@~Ev^pJvfAfFbbAbLnc@fZyMlYcFb^b^fYsA~VdPnUlz@}@qWhh@xf@zNnYtd@mBpd@lWpPbVyDvn@bGzEnPnm@Cza@jb@dAdt@dpA~Xpj@oDrKtLjd@}Fn}@hHvgB{^uw@uw@bDgg@hn@oIzCuf@nS{p@wYga@fZeHePol@oX{lAw~@tVcn@iGaLi[ip@mHeb@_RoK_q@us@aKyHgUm\\tO{Q|@',
        ],
    ],
    [
        ['Turkmenistan', 'Turkmenistan', 'TKM', null],
        0,
        [
            'kpeBmrpAsZyS}eA_Lgi@nPwj@~o@a_@aBoeAYfIo^mt@qTss@ic@esA``@uEzp@}VxKqbA{A_ThJu]l_AofAdj@wg@l\\k`Ap]crAvYt@fe@zQ}@l\\uOxHfUts@`KnK~p@db@~Qhp@lH`Lh[bn@hGv~@uVnDss@pm@eAlfAkv@|p@yEbdAu^lk@wDlZrJvh@y@nk@vb@zu@`KrJek@aHk`Avo@eTaOwi@nh@uByLus@}y@jN}u@_Spl@od@zPwb@hq@|NjExl@pRog@',
        ],
    ],
    [
        ['Jordan', 'Jordan', 'JOR', null],
        0,
        [
            'sldAsg~@{IuRsdAvWkyBsaAeXbkAzJlHd|Bj^i}@n}@tSpIfI|Stn@tG~MnU~YfRpdA_I`A_Hc^}bBl@iWeHkQAee@',
        ],
    ],
    [
        ['Nepal', 'Nepal', 'NPL', null],
        0,
        [
            'obkDimu@xC|YgGvf@dFtW`s@`@djAqMfo@}D`c@y^ttAcGnpA_b@|y@u]p{@sViWoy@sf@i[}X_Ncq@fRa~@tg@cb@~G_T~\\qo@hKuq@lZweAjMygA`E',
        ],
    ],
    [
        ['Yemen', 'Yemen', 'YEM', null],
        0,
        [
            '_qdBobd@{o@bfBmStj@fl@xO`KvZn@hTd}@jYzbBb\\~v@bk@nZlBvQuBpc@|Xxf@~Jls@fBxNpBtLnOjOpCrHzN|]k@~RnGfj@eBfOoc@w@ea@dImQfKem@|PuXoKaBlEq[sFaKxAgZmZ}RjEiYqOw]uXfO}OsDcgAm@mJfEm{@fE}VcBsNxSe\\mIwk@s`Aky@c[esD}V',
        ],
    ],
    [
        ['N. Cyprus', 'Northern Cyprus', '-99', null],
        0,
        [
            'w|~@gscAkCKaHaN_l@Zyw@uQdi@rYqCtJvEeA|JvChHi@bBlAf@iEnC{B`KS|OhDvJgB',
        ],
    ],
    [
        ['Philippines', 'Philippines', 'PHL', null],
        1,
        [
            ['c_kF_yW|^sn@qt@fAuTnUpO~t@vYc^'],
            ['slnFynRuNoP{Eye@oa@uB`Ibi@gm@k{@~Drz@lUpSpRnf@rRnQne@ej@{KwO'],
            [
                'qyuF}lOkEph@sB`b@fTdx@zUw~@d\\v^}R~l@zPh\\phAgc@pPgl@aRw\\rf@q\\rR|Xj\\kAhm@za@hIiQoWus@kf@qPca@qVaUh[on@cPgI{Zck@u@tBio@uq@r\\gDn^kC|U',
            ],
            ['qmfFgeQdrAhz@s]wj@el@qe@od@gj@w_@c}@eJ~q@hh@ja@v_@~i@'],
            [
                'a}mFarb@dI|XkTvk@nO~r@xc@tSzHjq@_Mxp@c`@zEsZmFamAta@|D~`@kS~MnEx[to@u]`Vy_@bO|Uvf@kd@xw@dH`^yLcByXqR{NtQoM`GpUz]}b@hHeZhA{z@cXpSoEw`BkSsw@yd@@qe@xPgRgOuDzN',
            ],
            ['kjmFohUrHw\\od@jRwf@Cd@bY|[pYtf@vQfAa\\mC{^'],
            [
                '}btFewVoPxdAdo@qOi@|SgNpe@t\\~LrA}j@xQgBvHyd@wc@|CXsVde@wn@_{@j@gPhV',
            ],
        ],
    ],
    [
        ['Sri Lanka', 'Sri Lanka', 'LKA', null],
        0,
        ['wv~CeuMlH``AdYxPju@hMv\\up@`J{xAi[mdBej@va@a\\~j@g]``A'],
    ],
    [
        ['Taiwan', 'Taiwan', 'TWN', null],
        0,
        ['czlFssn@rd@dcBxYfr@|_@ws@bFim@yc@k|@_q@in@o[pQxIvd@'],
    ],
    [
        ['Japan', 'Japan', 'JPN', null],
        1,
        [
            [
                'ybtGyokAzx@|}@a@n_AnVzp@{Ih^p_@`k@xnAj\\zlBzB`xAhfA~h@_WrAwm@tkBxL|hAl\\dhAd@k~@~l@th@fiBlg@fYf]gWkNiw@pf@eQlX{i@cz@gRw_@if@{}@i_@{l@ui@k{BuQ{aAxKk`AcnBuh@z\\uzAo}@ob@iWif@mkAvIgeAmYof@maAoJaa@tuAx@tq@',
            ],
            [
                'imyGqztAgk@oY{LdeAt{AbPvu@`}@haBwi@~`@jcAndA\\pGc}@{]ao@yaAoBeQmuAoQuo@mhA``A}n@~S}j@hL',
            ],
            ['epaGoj`Aqa@gd@qb@dFuXgY{l@nL_GlTdb@xd@rXaS`_@nMpOpc@vg@wPOu\\'],
        ],
    ],
    [
        ['Chile', 'Chile', 'CHL', null],
        1,
        [
            [
                'r`eCvxeBApjC}aA@sd@t@tSfXrt@lRt]_A~c@aDjl@yQn`A_HrmA}a@x~@q`@buAaeAqr@bLwvAvh@{qAlUg_@s[iSyi@qx@yXok@jF',
            ],
            [
                'j|fCvia@s]ni@iGbl@y_@lYtRn{@q`@`eAoWduAal@qGsFrNlT|_AbcAz]_AbgB`LbSuQnW`k@ze@|g@ry@jUxw@}Dn{@ne@h_Ay[zjBeOlJBnx@tb@~{@m@ds@hn@xg@Elx@_R~{@ld@tUtOvv@tM~~@qIdkAbXvKsMbgAe[tVrSdY_\\pKuEnVfZzJuEtc@xUvqAb`@jt@gFp^xRtf@|n@lZmDhaA_UrUsh@_Cd@xm@{Xlc@avCjG{x@vHpv@Mb]jNjw@pU`Ijy@nYl@neAiSpfAoj@??vlAwb@pRsf@uPsc@l^qh@~FoiBqYc{@_aAio@x}AeQoz@gv@gTyfBodA~Ts_@o`C|h@qOnR~lAlf@yGsRkxAiTyrBu[ui@~P_|@bDmeAiY_Ake@}cBej@_cBoYc|AlMs|AuQqr@nFelAqc@ikAgJ{wBaSy`CqRwjCpCieB`L_wAe_@}NwOa_@',
            ],
        ],
    ],
    [
        ['Bolivia', 'Bolivia', 'BOL', null],
        0,
        [
            'rxfCnkTom@fDe_@i@}L}Qsu@iX}_@oVypAqItExm@uF`W~Czh@{bA~v@_eAhIqWjVgi@jK{XbQif@Sic@pQwAbc@eKfQY|YfQ`@aWvgAyvBrAdH`c@uEtWca@nPyMze@bJfp@bPjZ_Erb@nR|K`@iRfy@}^`y@[zkBdQ~\\~u@p@r`@rWxiA`IkLhfAqAjWfq@vc@cl@vpAgNbs@nw@`l@pGnWeuAp`@aeAuRo{@x_@mYhGcl@r]oi@kf@mbAzYqs@kM_TfJeVmWe^g@et@aB}j@mLeT`u@qcB',
        ],
    ],
    [
        ['Peru', 'Peru', 'PER', null],
        0,
        [
            'jogCrkGhw@}AjGlHdr@~JnfApi@pCb\\|NvTgEx`@vd@`QAjYnOlJ_Yfw@wa@`e@fLxYoh@rBsVj`@ev@p@gr@yc@dC|}Am[dFgb@wIau@pcBlLdT`B|j@f@dt@lWd^gJdVjM~S{Yps@jf@lbAvO`_@d_@|Nr}@{b@lDuX|zBw}@`oBicAdo@qe@zXsr@gI_Q|s@_qAr|@irB`z@m{BpXo[tRam@no@wg@pk@iXgS{Zh]sz@mRyj@yp@mf@mF~XxPzMu@|UyX_DgXvEgYp^ib@uXyJei@ie@ku@ejAsWccAm`AmRug@tGmn@sO}Dqh@r\\_Sn\\{[`O{c@p`Aom@xFma@oOqUxIqd@kDyn@f\\hg@r~@uQn@g^d`@',
        ],
    ],
    [
        ['Argentina', 'Argentina', 'ARG', null],
        1,
        [
            ['r`eCvxeB_W~[g^zm@gpAnd@ovArNb[f^jz@bBz^aUrd@u@|aAA@qjC'],
            [
                'ppoBn_z@rN`q@tOf_AQf}@pLzLxCjg@fCr_@inApt@nG`j@af@fZdBp]`{@boAt{An`@h|B~KtcAgEcLfd@xKxm@qJn^nd@~T~~@rGb{@wUbWhOuGb}@gi@xQea@uRsQl_@px@lRdq@xe@dHz}@vMn`@`z@D~o@~^|Pzm@o|@vl@wz@rKnT`w@xhAfb@rg@hhA`x@rWrXh\\eSz_Ash@dc@jYeBzx@wH`vCkGzXmc@e@ym@rh@~B~TsUlDiaA}n@mZyRuf@fFq^c`@kt@yUwqAtEuc@gZ{JtEoV~[qKsSeYd[uVrMcgAcXwKpIekAuM__AuOwv@md@uU~Q_|@Dmx@in@yg@l@es@ub@_|@Cox@dOmJx[{jBoe@i_A|Do{@kUyw@}g@sy@ak@{e@tQoWaLcS~@cgBccA{]mT}_ArFsNcs@ow@wpAfNwc@bl@kWgq@ifApAaIjL{qB~dBcr@nHkkAbm@k_AlW}GrZn|@~}A_~@~OeeAnHmp@_Iuw@{n@gIev@}]}Jk^`c@h@zp@rs@na@|h@lXpeAt{@jrAdtA',
            ],
        ],
    ],
    [
        ['Suriname', 'Suriname', 'SUR', null],
        0,
        [
            'xniBooCxb@gLn\\jEdXoDfE`QmIlKrDvK|`@cDde@iu@dGgb@`SCtZkl@qJg_@jBwM}d@iO_Iew@{iAnKuEgJqq@oCebAvOp_@vt@}Cvi@qW`d@|IzYnDr[|NfY',
        ],
    ],
    [
        ['Guyana', 'Guyana', 'GUY', null],
        0,
        [
            'tlmBwuBfNfApa@iDhSrOf[~IvRtA|EfKt]cBle@i\\pC}[~Nq^_Iet@iPaUhMa\\nTmHcGmZpMkMn_@vAfi@mn@}OePf@{[me@aIoNuJjTeVmDyUqp@uc@_h@~Uue@tg@w@d_@qVn@o`@n]uWvT~Hdw@|d@hOkBvMpJf_@uZjl@aSBeGfb@ee@hu@',
        ],
    ],
    [
        ['Brazil', 'Brazil', 'BRA', null],
        0,
        [
            'zfgBn}`AhPkb@qZs\\bc@qi@~o@oa@j_Aag@dVx@t}@io@pg@rEkrAetAqeAu{@}h@mXss@oa@i@{p@j^ac@|]|JgKac@oG}c@?ka@nUiJlV`IhVwAhFaWxDgx@tJuQdi@}OpXfK|`A_KcCysAlQwa@oR}K~Dsb@cPkZcJgp@xM{e@ba@oPtEuWeHac@xvBsA`WwgAgQa@X}YdKgQvAcc@hc@qQhf@RzXcQfi@kKpWkV~dAiIzbA_w@_D{h@tFaWuEym@xpApI|_@nVru@hX|L|Qd_@h@nm@gDfb@vIl[eFeC}}Afr@xc@dv@q@rVk`@nh@sBgLyYva@ae@~Xgw@oOmJ@kYwd@aQfEy`@}NwTqCc\\ofAqi@er@_KkGmHiw@|Ac[kjDo@aZxHyb@vZyUIkl@gb@iIoKlEaA}Vrc@mEVcf@wxBl@uSqTkPxReKzc@yJuFka@``@so@aCaKcRom@sMwXgIgFmYsk@yPjBcL|s@kDtGkf@qA{h@~ZeOuJwDim@|Fup@rN_QwM_l@uH{dAkV{U{VhGsPo_@wAqMjMbGlZoTlHiM`\\hP`U~Hdt@_Op^qC|[me@h\\u]bB}EgKwRuAg[_JiSsOqa@hDgNgA}`@bDsDwKlImKgEaQeXnDo\\kEyb@fLiZzKiR}O_MrAqGrP{\\oC_WwVeR_m@}c@ex@iT}AmNpa@ab@flBm`@jIu@bj@~m@lr@mRxQmmBxHiAt}@mn@_h@smAlUyfBde@o]rc@fIpa@ugAgRsxB``@k|AmAm{Avr@ynA~dAco@~Pmt@pAuUtReTpnAkIxd@zWhfBx^xg@bwA~uAxf@reAfm@du@rNf@lP|l@mCbtBlPh_BrEfh@xRrW`JprAj~@rpArIn_Apq@bZrMld@|bAChaB~V~j@xZ~dAfQphAvp@zs@~|@bHtm@kIna@tJb~@bMn]tj@ja@jdA~lB|u@rp@ni@d\\n[nz@jh@tb@',
        ],
    ],
    [
        ['Uruguay', 'Uruguay', 'URY', null],
        0,
        [
            'ppoBn_z@qg@sEu}@ho@eVy@k_A`g@_p@na@cc@pi@pZr\\iPjb@~Yhf@reAva@bm@oKx`@tExx@{Yji@`A`e@sa@yCkg@qL{LPg}@uOg_AsNaq@',
        ],
    ],
    [
        ['Ecuador', 'Ecuador', 'ECU', null],
        0,
        [
            'xerCnHuGln@lRtg@bcAl`AdjArWhe@ju@xJdi@hb@tXfYq^fXwExX~Ct@}UyP{MlF_Yi`@um@pLiZzV~[ld@kZuKsPpIww@}TkHoJ}e@sVgg@jCoXga@mL_j@{Wo}@tb@sJ_@gNzYat@tGwP}Hu]tSwYxM',
        ],
    ],
    [
        ['Colombia', 'Colombia', 'COL', null],
        0,
        [
            'vraCimAxJtFdK{c@jPyRtSpTvxBm@Wbf@sc@lE`A|VnKmEfb@hIHjl@wZxUyHxb@n@`Zb[jjDf^e`@tQo@ig@s~@xn@g\\pd@jDpUyIla@nOnm@yFzc@q`Az[aO~Ro\\ph@s\\rO|DvYyMt]uSvP|H`t@uGfN{YrJ^n}@ub@nGkRiVuCvAi^sMuU_^eCkYgf@{Vy_@~U{MwJgc@`Mex@kLkOzH{s@hXi`@aGk]cSnCwJqQnMyc@sFeHg_@~@}m@sj@uXsESuSqJys@yb@_\\kf@e@_D_L{o@dDep@q^kW_Mg]a]cUxBmOlOdK`Tbg@lIzNf^dW|PbQfVtFpk@hPpc@g_@dCaGv[wLvL}CbXlFbVgA`LkNfD{MvTkoA_Eic@~F_k@vt@gXuE_l@jBsb@cFcUvIhJr`@|L~SzCxk@qKph@wPpQeA~Lt^`^uUxLsOxTaRj}@',
        ],
    ],
    [
        ['Paraguay', 'Paraguay', 'PRY', null],
        0,
        [
            'jrpB`lf@mQva@bCxsA}`A~JqXgKei@|OuJtQyDfx@iF`WiVvAmVaIoUhJ?ja@nG|c@fK`c@fIdv@tw@zn@lp@~HdeAoH~}@_Po|@_~A|GsZj_AmWjkAcm@br@oHzqB_eBsWyiAq@s`@_]_v@{kBeQay@Zgy@|^a@hR',
        ],
    ],
    [
        ['Venezuela', 'Venezuela', 'VEN', null],
        0,
        [
            'zruB_dIiGrPzUzVzdAjV~k@tH~PvMtp@sNhm@}FtJvD_[dOpAzh@uGjf@}s@jDkBbLrk@xPfFlYvXfInm@rM`KbRro@`Cja@a`@`Rk}@rOyTtUyLu^a^dA_MvPqQpKqh@{Cyk@}L_TiJs`@bUwIrb@bF~k@kBfXtE~j@wt@hc@_GjoA~DzMwTjNgDfAaLmFcV|CcXvLwL`Gw[f_@eCiPqc@uFqk@cQgVeW}P{Ng^cg@mIv@vMtc@hFkSj[Vt_@pZfc@sVrp@}YaCaMel@jR_UdBin@{lAkXtGo\\}TuRmUzj@yj@`@sg@xa@mAtScw@PwaAmEyb@~Zyn@vFab@qRUuNmlAyB{iA[`t@nQiTn\\_q@tCkn@v]_I`q@q_@m@oWvMpp@tc@lDxUkTdVnNtJle@`Ig@z[|OdPgi@ln@',
        ],
    ],
    [
        ['Falkland Is.', 'Falkland Islands', 'FLK', null],
        0,
        ['~ovBrgdB_jAod@ct@rNod@_X_q@b[vQzTjsAvQb[{Tbt@b[f^c['],
    ],
    [
        ['Ethiopia', 'Ethiopia', 'ETH', null],
        0,
        [
            'yi|AesNpoDpzDlpAvAtv@`k@`g@d@bPtRti@?fXcT`x@bYnQ`Yrh@}CzLeFrMt@vRSbnAat@nj@?jTqS?ab@l_@oI|c@_cAp[oM|I_Xt^m]je@oCiTsb@e`@o@iHcRXew@mQk`As\\oPiEqXwYwn@wd@}]kXq|@_Iut@wgA`LoRsm@}d@j[sc@wMcN`Lyi@Vmu@`XcOrTwZ`SuXrc@kTfS~TrZbTh\\{CfP_@~Q{a@`@aNmC{LbJrLbUaVla@aVb]{VfUikEdiAqs@K',
        ],
    ],
    [
        ['S. Sudan', 'South Sudan', 'SSD', null],
        0,
        [
            'cf{@izE~u@qh@zMuYxa@fLz[cCvOnI`[qFzd@sr@`IyRtm@wWxNod@~X_Z`i@q_@PiSfa@gXni@mWeRyEmTyJcOwv@eP_\\al@qGuIdPe_@lc@ePjDqUwIal@dAqGzKg}@?cA{Ke_@yJmEgQsV{Kqs@nc@e_@mEc^al@ia@ka@jDod@~MgQqd@gBgC}L_\\hCnFbm@oF`l@e_@tWoFlT`@b^sGf@Wto@hHbRd`@n@hTrb@ke@nCu^l]}I~Wq[nM}c@~bAji@dh@le@hd@le@v[~j@Chq@rMtf@_MvX`P',
        ],
    ],
    [
        ['Somalia', 'Somalia', 'SOM', null],
        0,
        [
            'afpAdhB~c@qr@VubFsu@{eAcPuRag@e@uv@ak@mpAwAqoDqzDsj@es@e[ke@?s_@?_~@GwXKa@??_Se@y[iHc`@iEq\\kTuVEm@hPvDhc@Ez_@dLpUrPpbA`]xdAre@xnArt@rzAjt@~dAnhAftAp}@pq@n|A`}@fy@pn@jcAtjAlM|_@bMxM',
        ],
    ],
    [
        ['Kenya', 'Kenya', 'KEN', null],
        0,
        [
            'cqkAhcHtxAo}@fCgc@raFi~BpI{ERgaA{PiXw]kh@wUql@nZwfAhFk^r\\kj@me@id@ki@eh@m_@nI?`b@kTpSoj@?cnA`t@wRRsMu@{LdFsh@|CoQaYax@cYgXbTui@?ru@zeAWtbF_d@pr@vj@~WlN`YlVpCzG`k@`SdXdKrh@dXrS',
        ],
    ],
    [
        ['Malawi', 'Malawi', 'MWI', null],
        0,
        [
            'm~~@|_Qi|@rJqKhPeTb\\oP~sAnPnn@oPfpAuT]qUdSeYdl@iDjoA`ZbL`Rjj@xg@qe@rCak@eLa\\rBaXtWyNdPvD~b@_]z_@eO_Ray@sRwT~Jyr@qKsq@uI}O|Nat@n\\{Z',
        ],
    ],
    [
        ['Tanzania', 'United Republic of Tanzania', 'TZA', null],
        0,
        [
            '_faAjz@qIzEsaFh~BgCfc@uxAn}@x[~kAuBlb@_g@vU{@fOdPvd@qB~Q`Cz\\yTbf@{Xr|@}UtL??vp@fc@hcAfWnd@_@hUvQnj@r@hOzFbjAsP~m@`DnP_tAdTc\\pKiPh|@sJlb@yQvf@oIzWmIbY}N??v`@wmAfc@_b@nKgc@gEo_@fJox@{X_BsUsUkWq_@kNcLPiSlLcMrBsW??_Q}FsBwc@xWgb@}ToFocAVk~ByC',
        ],
    ],
    [
        ['Somaliland', 'Somaliland', '-99', null],
        0,
        [
            'gr~AehU??J`@FvX?~}@?r_@d[je@rj@ds@ps@JhkEeiAzVgU`Vc]`Vma@sLcU_Vm`@kSnJgKzXe[bY_^F}y@_O_cAmFav@kR_^cCiUkJqb@gA??',
        ],
    ],
    [
        ['Morocco', 'Morocco', 'MAR', null],
        0,
        [
            'rfC_ucAqV~f@wB~d@qT~`AmOfLlJhWxpApIf[bVbc@lDtAfm@bhAvWzVh^dr@vOj}@pH|cBbm@O`iAnH?m@l`@re@`AbSdMj[?rUcGrs@vEhSto@pRpCj\\xmAzuAlbArShuArX`[nFnUvkC~C`@A}A_\\_W_PmSq_@~BeTmTak@ya@wf@aTaIoOoc@o@g`@qUse@sh@yUsf@y~@c@[m^_Wcy@}Egp@ui@i^uOes@es@rNwlAwVwt@kG}_@gg@ei@u}@q[im@yXyh@w_AsRke@_m@Hud@nYmz@iCw_AxLcZT',
        ],
    ],
    [
        ['W. Sahara', 'Western Sahara', 'ESH', null],
        0,
        [
            'r|Oo_u@AdCd@`KDt}AblEgB_Az~Cpy@rDhNb_@{JfyAvsFKrLxSuAkYa@@wkC_DoFoUsXa[sSiuA{uAmbAk\\ymAqRqCiSuo@ss@wEsUbGk[?cSeMse@aAl@m`@oH?',
        ],
    ],
    [
        ['Congo', 'Republic of the Congo', 'COG', null],
        0,
        [
            'i`c@_zEtBvd@vQj`@dK~e@xFjv@iBlb@dItTp@|UdF|Rdh@b]r[d_@bZt{@aAlr@vN~Rlc@p]vc@bf@jVaJ~BuP`a@SjT|VjOkElVmTzQnIfX~Yhr@eaAqn@oa@pVih@mTwNei@sF}CuZm`@~\\cv@rAeRq\\{Fqh@xEwo@p\\_d@aZkgApNmKnm@bDnPi_@qCgZ{mAlAoq@nOup@vMoCw`@w_@cy@gd@c`@ii@nIeg@nB',
        ],
    ],
    [
        ['Dem. Rep. Congo', 'Democratic Republic of the Congo', 'COD', null],
        0,
        [
            'whx@fxGgJnx@fEn_@oKfc@gc@~a@w`@vmA??rWkE|rApIvOnFxPzf@_MpZbJ~hAvFv}@{ObJwj@hWcPkJgDjbAzn@OrXka@`VuYzn@uG`Mw_@de@tR`q@uGzSk[tf@wDf\\n@rBmRpTq@l[uBve@jHbZq@nNvDkBkiAzSeVpCme@eHud@tKcWb@if@xjAPmDqUz^FjBxIve@lAtNlc@jHrNpa@yGrSxGhh@`D|Vu_@jMgS|Pmd@jNsm@lwDY|TnFbQc@xXjGvGkR}NsE}@gZgIaOwUcLkOjEkT}Vaa@R_CtPkV`Jwc@cf@mc@q]wN_S`Amr@cZu{@s[e_@eh@c]eF}Rq@}UeIuThBmb@yFkv@eK_f@wQk`@uBwd@sDsj@iWw^o`@cSmr@fTyf@`Vul@dEsm@dKuQwd@qGyCo[fEsdAe^sWfLgS{@kHeNeVkDan@pEag@l@sSsE{d@rr@a[pFwOoI{[bCya@gL{MtY_v@ph@??xB`hAaXnG`SdU~VpO|Vr_@bL`\\nBbq@nMzVPbn@|PlPhAdd@rGxCvDda@uNl[_CjjA',
        ],
    ],
    [
        ['Namibia', 'Namibia', 'NAM', null],
        0,
        [
            'oze@~jo@@xeFxv@|^p`@pChf@yJ`[oCnIwYtWcP|\\|]lm@gn@nWsl@vL{{@lNgl@|Sg_Bj@wiA~Fca@hWwXh_@sr@x_@_jArLgf@zq@_|@xB}n@a]{Jmd@uIog@z@id@f[mHkCi|FuAij@|\\ivCzG{qBoXer@eMog@pBuWbMMdDdb@`M~QBzf@nWzVwXj_BzTnm@`Az@r}Er|@dAAluD',
        ],
    ],
    [
        ['South Africa', 'South Africa', 'ZAF', null],
        0,
        [
            'q|^`yv@}\\}]uWbPoIvYa[nCif@xJq`@qCyv@}^AyeF{OjHad@jz@xD`e@_M~Twk@kEg^}Zs\\yQgN}\\o]mMkYpFy\\nP{q@bB_g@qMiEoR_J}\\_a@_DwQmVySuh@cw@sm@mwAam@mXTg]rIaToFe`@fE}\\|vAiOjk@dJtdAkDlUp^mJ`QlCzDfQ`PlVQrTid@z`@qc@wEwKwZkn@NrNnl@jF|r@dOd[ri@p^dK`HnYv^lPb_@lb@vk@reAn_Abk@nd@dn@l[j`AfWx^fB`GjP~d@gH|]zJvbAaKzd@rFzXgBl_AtWjt@zHre@rVl[n@lYgUbTe@zY{Z~AtGhGyOKuc@hS{h@eSkJr@}n@|g@oy@l^}s@@Ezk@epA',
            'crw@vpw@fZgRf\\tKx`@nWj`@pf@{m@`o@kUeEoJ_Sya@wHsIkSeRm]tTyQ',
        ],
    ],
    [
        ['Libya', 'Libya', 'LBY', null],
        0,
        [
            'oyo@_~i@?x{BzfADVfYhxFuvBfxFuvBb~@da@dk@fVdb@ka@xaB}YlZcf@jp@a\\d\\nJfU{a@hAwY~c@ql@yWcYlDif@}Fea@nCo[_J_r@jBa\\fSev@o]mMmDmYtE{X}i@aWgRaSm]}PqB_o@khAnTgYkDgs@lI}qA|Zg\\pv@cw@bKawAbYqaAb^o]gO}\\w[pM{n@sRk]al@i\\_j@oGqsAvKiT~ZgVF}RrIa}@jFgNrSrU~\\uHtYbOre@wQhq@?h}E?beF',
        ],
    ],
    [
        ['Tunisia', 'Tunisia', 'TUN', null],
        0,
        [
            'soQgez@rYeoBpe@eXPcN`r@gd@pDan@qe@{a@uMqr@zHqz@uKa_@acAgXwj@nFx@r^_t@_VmC~Jf^r]L|[uTnNfG`u@bh@l^{J`a@i_@`@wNv\\wVvHpB~n@l]|PfR`S|i@`WuEzXlDlYn]lM',
        ],
    ],
    [
        ['Zambia', 'Zambia', 'ZMB', null],
        0,
        [
            'g`{@fhOcY|N{WlIwf@nImb@xQo\\zZ}N`t@tI|OpKrq@_Kxr@rRvT~Q`y@{_@dOt|Dnr@}Dnk@hn@pGrb@zWpFtTjUzCju@lr@ra@lg@`Tl@hSeFzdAyEfJuCLeDtWcMng@qBdr@dMxg@af@bi@cr@{A{eEcaCXhDqTiHmV~Ii\\cFi]rEkRqTp@sBlRg\\o@uf@vD{Sj[aq@tGee@uRaMv_@{n@tGaVtYsXja@{n@NfDkbAbPjJvj@iWzOcJwFw}@cJ_iA~LqZyP{f@wOoF}rAqIsWjE',
        ],
    ],
    [
        ['Sierra Leone', 'Sierra Leone', 'SLE', null],
        0,
        [
            '|zXmkPm`@oZeFiPuIoLgPm@qMwJ_q@@kPjUqLfY`AdQaIhOT|UePqBb\\d\\d[z`@hBdQ|M~RxOsC~k@eXp_@o`@|IyUtFem@',
        ],
    ],
    [
        ['Guinea', 'Guinea', 'GIN', null],
        0,
        [
            'fwYsqWc]R}k@fNwLk@uC_Fca@|C_HoBsBzU{HAiOiGkI`AkPzNwY~CcPoLeSkG_NwGqKr@{LvLmFdPsXdYxKbOlAhSiLcEyFfFhBrQaR~PlKzC`DdTmMzXmN~p@dVpF~DtGyC`KtBfZzH@tPs@vKdXtPIbKiLcCcXbYge@jO~EhLl@dPpBU}U`IiOaAeQpLgYjPkU~p@ApMvJfPl@tInLdFhPl`@nZjZ_d@hWmW~NcGrNkK`FsZdHyLbQeIwZo]_Rd@iOoIwLC{HgGhDwSyEoEe@eT',
        ],
    ],
    [
        ['Liberia', 'Liberia', 'LBR', null],
        0,
        [
            'lnOk_NzAdQgEd]rLvZgQdPyRdCoYdY{@rW|DxFxClr@jOPl_Aw\\vw@sn@ft@ea@bi@ig@}M_SiBeQe[{`@c\\e\\iLm@kO_FcYfe@bCbXcKhLuPHwKeXuPr@',
        ],
    ],
    [
        ['Central African Rep.', 'Central African Republic', 'CAF', null],
        0,
        [
            '{mt@cfIrSrE`g@m@`n@qEdVjDjHdNfSz@rWgLrdAd^n[gEpGxCtQvd@rm@eKtl@eExf@aVlr@gTn`@bShWv^rDrj@dg@oBhi@oIfd@b`@v_@by@rEaQvAq[r[aS`Vg_@hDmUp\\u_@aDsQfEiY{Cmo@_NiJk^k~@ur@uCqJaOiId@sNdMumA}VqYkWq_@{TdE_UsPwDk{@zByy@}[el@ecAu^iXqf@sIcFvY_c@`f@EnXbI~X_ClRuT~Pqn@hZga@fXQhSai@p_@_Y~YyNnd@um@vWaIxR',
        ],
    ],
    [
        ['Sudan', 'Sudan', 'SDN', null],
        0,
        [
            'm~n@iaOpn@iZtT_Q~BmRcI_YDoX~b@af@bFwYWeN|UkQTic@bLcW|TrBiE}UeOaYbF{XqSeR~KsMoOqe@q[am@{t@jC`BawFWgY{fAE?y{BgzF?oqF?{vF?eSh|@vLjJcHh_A}UriAyVjNea@bVr^rb@`m@hIrRbRdEph@|YzzAuE~W~Htt@jXp|@vd@|]vYvn@hEpXr\\nPlQj`AYdw@Vuo@rGg@a@c^nFmTd_@uWnFal@oFcm@~[iCfC|Lpd@fB_NfQkDnd@ha@ja@b^`l@d_@lEps@oc@rVzKlEfQd_@xJbAzKf}@?pG{K`l@eApUvIdPkDd_@mc@tIeP`l@pGdP~[bOvv@lTxJdRxEoi@lW',
        ],
    ],
    [
        ['Djibouti', 'Djibouti', 'DJI', null],
        0,
        ['_vqA{nWwYlDyQiNyMjR~@|Xrb@|MyYbP~Ul`@zLcJ`NlCza@a@^_RzCgPcTi\\_UsZ'],
    ],
    [
        ['Eritrea', 'Eritrea', 'ERI', null],
        0,
        [
            '{cfAkd[tE_X}Y{zAeEqh@sRcRam@iIs^sb@ic@hgAePjx@ga@l]itA`z@wa@rb@{`@`c@qRnTu]vQxQhNvYmDjTgStXsc@vZaSbOsTlu@aXxi@WbNaLrc@vM|d@k[nRrm@vgAaL',
        ],
    ],
    [
        ["Côte d'Ivoire", 'Ivory Coast', 'CIV', null],
        0,
        [
            'ztN}|RcGsDiPjHgo@NqJgQwIf@aQaFuHvYqM}FyXgHa[rL}ItSc[dL{TuNg\\kAyi@bOqOzwAjYns@fOreAaZxt@xAtWl[Rrj@gK`g@V~hAzIlj@`Qz|@|U`Ku@yCmr@}DyFz@sWnYeYxReCfQePsLwZfEe]{AeQ{HAuBgZxCaK_EuGeVqFlN_q@lM{XaDeTmK{C',
        ],
    ],
    [
        ['Mali', 'Mali', 'MLI', null],
        0,
        [
            'rnUuhW{AoRhDcWlVqPhKyb@zA{e@aTkJoIyc@yRm@sj@jPgb@iKeWbCkH{LwyF_@}Lwj@zIuFb]wlGd]wlGu~Ac@yqEjgCyqEjgC{Mh\\}e@zP}[bIUxf@idAcEE|nCda@vh@hDne@nv@zHftAjDbVfU`g@lA`g@HrN_Kja@zGly@|X|JpRno@~ZnG`OdYtKd]kGbPfNdHxi@rp@xr@m@dT`PnYeCfc@xXfHpM|FtHwY`Q`FvIg@pJfQfo@OhPkHbGrD`R_QiBsQxFgFhLbEmAiSyKcOrXeYlFePzLwLpKs@~MvGdSjGbPnLvY_DjP{NjIaAhOhGzH@rB{U',
        ],
    ],
    [
        ['Senegal', 'Senegal', 'SEN', null],
        0,
        [
            'rs_@upYvXuo@d^gUoZyJg]}j@{Ma_@kTaSa^lDo]sL}a@Uy\\jQoh@pOyd@|l@gh@|i@{Aze@iKxb@mVpPiDbWzAnR~GnBba@}CtC~EvLj@|k@gNb]SnrBsAxO~EtS_A``@dIhI{n@}w@h@_NwGeJQeVmMyYfLcZ`@aZ_MrKaQrSnIjRGtWkNxR^bMvM`cAx@',
        ],
    ],
    [
        ['Nigeria', 'Nigeria', 'NGA', null],
        0,
        [
            'ggDefKqBwcBp@wf@wJmf@gRcRi]ue@pEyOiKeX`Mad@mAwSkCyv@{PeXyG}b@gOoLebAmFs}@hVmVrV}^`@s\\kNsjAh_@{^o@{c@sYsc@z@aQwGs`@rBko@fQ{o@}a@uMnAgi@jcAsJk@wW|WxEfJhBxSrs@ho@nO|f@xGl_@hL|LpKvj@l`@vXtHr^`MdXxD~X|i@`Tbb@uXtV^dd@rc@bQPt\\f{@bOfk@z_AnUtViB`W~L~p@i@l`@cf@pSgl@fk@eh@~m@Xbv@A',
        ],
    ],
    [
        ['Benin', 'Benin', 'BEN', null],
        0,
        [
            'ggDefKtr@hFjNcj@yAqnCpK{KjAs]tT}TbRmQ_G{_@mTcFwKiZq]yDsLuQ_TiQmUEsn@~b@lAvSaM`d@hKdXqExOh]te@fRbRvJlf@q@vf@pBvcB',
        ],
    ],
    [
        ['Angola', 'Angola', 'AGO', null],
        1,
        [
            ['gkXxiHvUbLfI`O|@fZ|NrEtO_n@gX_Z{QoImVlT'],
            [
                'caWf|JyXkGcQb@}ToFmwDXkNrm@}Pld@kMfS}Vt_@ih@aDsSyGqa@xGkHsNuNmc@we@mAkByI{^GlDpUyjAQc@hf@uKbWdHtd@qCle@{SdVjBjiAoNwDcZp@we@kHm[tBsEjRbFh]_Jh\\hHlViDpTbaCYzAzeEci@br@yg@`f@zqBnXhvC{Ghj@}\\h|FtAlHjChd@g[ng@{@ld@tI`]zJzDif@uG}u@qTgx@gByYgSiw@{MsX}b@{g@aSyZqEim@hBmb@tQiUrO}d@jNod@kB_LeRwW|Qk{@xK{h@h^qf@}DcK',
            ],
        ],
    ],
    [
        ['Botswana', 'Botswana', 'BWA', null],
        0,
        [
            'onx@tcj@lwA`m@bw@rm@xSth@vQlV~`@~C~I|\\hEnR~f@pMzq@cBx\\oPjYqFn]lMfN|\\r\\xQf^|Zvk@jE~L_UyDae@`d@kz@zOkH@muDs|@eA{@s}Eom@aAk_B{T{VvX{f@oW_RCeb@aMgJtCaW|p@qKbJuRdc@weAtcAwYtEC`UkQrf@ko@pHyf@f[',
        ],
    ],
    [
        ['Zimbabwe', 'Zimbabwe', 'ZWE', null],
        0,
        [
            'm|{@vmj@d`@gE`TnFf]sIlXUxf@g[jo@qHjQsf@BaUvYuEveAucAtRec@pKcJ`W}p@{dAxEiSdFaTm@sa@mg@ku@mr@kU{CqFuTsb@{Win@qGaChVcs@g@}[dLoLlNw\\pCo_@`SCbnAdKhj@tAtm@aIpQ`Fvc@lHtDnO`l@z`A~eA',
        ],
    ],
    [
        ['Chad', 'Chad', 'TCD', null],
        0,
        [
            '{pm@wfe@aB`wFzt@kCp[`m@nOpe@_LrMpSdRcFzXdO`YhE|U}TsBcLbWUhc@}UjQVdNpf@rIt^hXdl@dcAxy@|[j{@{BrPvDeE~Tp_@zTpYjWtmA|VrNeMhIe@pJ`Otr@tCyH}OtRaj@xG{XfZsIzc@mc@qLo\\o[fEsPmC}a@R~`@yw@gAqh@dCmh@xW_g@gEm\\bg@m@Egg@`YcV_ZiqAwnA}y@gBipAcWy}BqL}Y~XkT^{RjViOjNc`Bc~@ea@gxFtvBixFtvB',
        ],
    ],
    [
        ['Algeria', 'Algeria', 'DZA', null],
        0,
        [
            'v}Ogot@e@aK@eCNaiA}cBcm@k}@qHer@wO{Vi^chAwWuAgm@cc@mDg[cVypAqImJiWlOgLpT_aAvB_e@pV_g@a{@ea@sbA{Imf@wXe{@aR}hBcJkfBaDo^fH{y@sWwaAMmXnMwi@wBtK`_@{Hpz@tMpr@pe@za@qD`n@ar@fd@QbNqe@dXsYdoBgSdv@kB`\\~I~q@oCn[|Fda@mDhf@xWbY_d@pl@iAvYgUza@e\\oJkp@`\\mZbf@duEbvB|sDxyBdwAzZhdAbETyf@|[cI|e@{PzMi\\xqEkgCxqEkgC`jFivC',
        ],
    ],
    [
        ['Mozambique', 'Mozambique', 'MOZ', null],
        0,
        [
            '_obA~nU_n@aDcjArPiO{Foj@s@iUwQod@^icAgWwp@gc@????aI~ZpAh}@wFxu@mAt`B}Ir]rQrk@fWlj@vf@ve@dx@vVleAh]reAbbA`WjJrj@lk@vXlMfDpk@s\\hn@iKtc@YtQaJcBx@h|@bI~[uMvIfH~XbYdUpr@bTdjAz`@jZ`ViDjY_OdCjDz_@jn@OjDsZfHa[jDmUeJudAhOkk@|\\}vA{`A_fAoOal@mHuDaFwc@`IqQuAum@eKij@BcnAn_@aSv\\qCnLmN|[eLbs@f@`CiV|Dok@u|Dor@_c@~\\ePwDuWxNsB`XdL`\\sC`k@yg@pe@aRkj@aZcLhDkoAdYel@pUeStT\\nPgpAoPon@',
        ],
    ],
    [
        ['eSwatini', 'eSwatini', 'SWZ', null],
        0,
        ['os}@zes@vKvZpc@vEhd@{`@PsTaPmV{DgQaQmCq^lJgH`[kDrZ'],
    ],
    [
        ['Burundi', 'Burundi', 'BDI', null],
        0,
        ['koz@zuCsBrWmLbMQhSjNbLjWp_@rUrUzX~A~BkjAtNm[}d@|CcRsb@g`@bC'],
    ],
    [
        ['Rwanda', 'Rwanda', 'RWA', null],
        0,
        ['elz@|eAyWfb@rBvc@~P|F??f`@cCbRrb@|d@}CwDea@sGyCiAed@}PmPeNjEid@gR'],
    ],
    [
        ['Uganda', 'Uganda', 'UGA', null],
        0,
        [
            '_faAjz@j~BxCncAW|TnFhd@fRdNkEQcn@oM{VoBcq@cLa\\}Vs_@_WqOaSeU`XoGyBahA??wXaPuf@~Liq@sM_k@Bme@w[s\\jj@iFj^oZvfAvUpl@v]jh@zPhXSfaA',
        ],
    ],
    [
        ['Lesotho', 'Lesotho', 'LSO', null],
        0,
        ['crw@vpw@uTxQdRl]rIjSxa@vHnJ~RjUdEzm@ao@k`@qf@y`@oWg\\uKgZfR'],
    ],
    [
        ['Cameroon', 'Cameroon', 'CMR', null],
        0,
        [
            '_i[ubXyW~f@eClh@fAph@_a@xw@|a@SrPlCn[gEpLn\\{c@lc@gZrIyGzXuR`j@xH|Oj^j~@~MhJzClo@gEhY`DrQq\\t_@iDlUaVf_@s[`SwAp[sE`QnCv`@tp@wMnq@oOzmAmAxFmB~c@`G|d@kGv\\bCtdBm@cHip@lWkh@n[qItK_[~N_HUgPcOgk@u\\g{@cQQed@sc@uV_@cb@tX}i@aTyD_YaMeXuHs^m`@wXqKwj@iL}LyGm_@oO}f@ss@io@iBySyEgJvW}WaA{RsPqB',
        ],
    ],
    [
        ['Gabon', 'Gabon', 'GAB', null],
        0,
        [
            'w_UilCw\\cC}d@jG_d@aGyFlBpCfZoPh_@om@cDqNlK`ZjgAq\\~c@yEvo@zFph@dRp\\bv@sAl`@_]|CtZdi@rFlTvNqVhh@pn@na@f_Ac~@hh@qr@|d@q_A_AwSsL_SeNol@sKim@aTsB}yARPejA',
        ],
    ],
    [
        ['Niger', 'Niger', 'NER', null],
        0,
        [
            'e_\\}sk@kNb`BkVhO_@zR_YjTpL|YbWx}BfBhpAvnA|y@~YhqAaYbVDfg@cg@l@fEl\\rPpB`AzRrJj@fi@kcAtMoAzo@|a@jo@gQr`@sB`QvGrc@{@zc@rYz^n@rjAi_@r\\jN|^a@lVsVr}@iVdbAlFfOnLxG|b@zPdXjCxv@rn@_c@lUD~ShQm@yi@`gAeM|@g]db@yg@jGm[}Ci]ag@mAcVgUgtAkDov@{HiDoe@ea@wh@D}nCewA{Z}sDyyBeuEcvByaB|Yeb@ja@ek@gV',
        ],
    ],
    [
        ['Burkina Faso', 'Burkina Faso', 'BFA', null],
        0,
        [
            'vpIegSdCgc@aPoYl@eTsp@yr@eHyi@cPgNe]jGeYuKoGaOoo@_[}JqRmy@}Xka@{GsN~Jag@I|Ch]kGl[eb@xg@}@f]agAdMl@xi@rLtQp]xDvKhZlTbFvu@k@|[}CdS`IpZqCpkB|An@nb@qG`n@xi@cOf\\jAzTtNb[eL|IuS`[sL',
        ],
    ],
    [
        ['Togo', 'Togo', 'TGO', null],
        0,
        [
            'gw@inT~Fz_@cRlQuT|TkAr]qKzKxApnCkNbj@hq@hL|L}TtOsf@|Cc^yLgw@tNyU|Dgp@Ckl@bYg_@sCoRwu@j@',
        ],
    ],
    [
        ['Ghana', 'Ghana', 'GHA', null],
        0,
        [
            'o@uoTrCnRcYf_@Bjl@}Dfp@uNxUxLfw@}Cb^uOrf@}L|T~`Brc@va@jThw@dQtv@wPyAuW`Zyt@gOseAkYos@pO{wApGan@o@ob@qkB}AqZpCeSaI}[|C',
        ],
    ],
    [
        ['Guinea-Bissau', 'Guinea-Bissau', 'GNB', null],
        0,
        [
            'hq_@aeWa`@eIuS~@yO_ForBrAd@dTxEnEiDvSzHfGvLBhOnI~Qe@vZn]j`@cYhYeCjMsPKoH`RgL|BkL',
        ],
    ],
    [
        ['Egypt', 'Egypt', 'EGY', null],
        0,
        [
            'c_gA_~i@zvF?nqF?fzF??ceF?i}EvQiq@cOse@tHuYsU_]crAa@e{@pO_}@lQ_\\vHao@yRwX{Pcv@eDmk@zF_P~]oMkScq@vMuo@pBw]wN??{a@bzAgEfOpPbXlLdn@~Op_@rMzIxScSd[}Zrk@qxAlEtD}X|`Ake@x}@gn@j`BaV|`@aShb@aw@ddAjK|I_Arg@ygA`w@}IxK',
        ],
    ],
    [
        ['Mauritania', 'Mauritania', 'MRT', null],
        0,
        [
            'li`@o_h@sLySwsFJzJgyAiNc_@qy@sD~@{~CclEfBEu}AajFhvCt~Ab@e]vlGc]vlG{ItF|Lvj@vyF^jHzLdWcCfb@hKrj@kPxRl@nIxc@`TjJfh@}i@xd@}l@nh@qOx\\kQ|a@Tn]rL`^mDjT`SlDu`@mPy]yFyy@|Ey|@pFa^gEe^bOu\\|_@_Z',
        ],
    ],
    [
        ['Eq. Guinea', 'Equatorial Guinea', 'GNQ', null],
        0,
        ['azQwmCudBl@QdjA|yAS`TrBtJmHmTeeA'],
    ],
    [
        ['Gambia', 'Gambia', 'GMB', null],
        0,
        ['rs_@upYacAy@cMwMyR_@uWjNkRFsSoIsK`Q`Z~LbZa@xYgLdVlMdJP~MvG|w@i@_GwZ'],
    ],
    [
        ['Madagascar', 'Madagascar', 'MDG', null],
        0,
        [
            'ow_BjjWqOpYoNhh@_IdjAgOf\\fE|\\`JjQdTsc@vJnQ{Jhm@nDnYfPlM|B|s@rWzgAx]buAre@luB|VzuAf[ngAzq@vMnu@lY~b@}Nrp@kUfP}_@bCmv@~Typ@vD_l@eJal@y[yICyS{\\kn@sDyf@nMq\\xJmf@~Cqx@yT_b@mGsf@c^iA{a@yKcViJmZYsb@sb@mr@oe@wQm^nGuYqYnFma@mj@e@qd@uS}ZyTxY',
        ],
    ],
    [
        ['France', 'France', 'FRA', null],
        1,
        [
            [
                'r{cBwbG|c@dx@dR~l@~VvVz\\nCpGsP~LsAhR|OhZ{K}NgYoDs[}I{YpWad@|Cwi@q_@wt@gTzE_m@xMeaAvs@iIrX',
            ],
            [
                'saKor_Bo\\jOayAnJp^xi@|Fnk@dPtIl[wD_AzNvl@bb@Zh[y\\yHoTlZrArPmQnVtT~QcOjo@{`@|FdFbZrw@hb@fzB}O`zAhSbFrd@lgAbGheAi[vUnL`rBk[zWiWi_@od@{Jo{Bn_Aq`A`m@s^p~AaWfEql@_pAsL}gBbOvRweA_z@xYopCwo@wQgr@uu@sK_H~Ta\\`@a\\`Xsj@n\\a_@{Cuu@n[_MjD_Qi@',
            ],
            ['saPggrAgg@{VsIrt@rSfo@j[wKnMai@sKeV'],
        ],
    ],
    [
        ['Ukraine', 'Ukraine', 'UKR', null],
        0,
        [
            'sa}@kwdBiVpAyNgM_RdBy_AaE}f@jb@rNtKeDjRyp@~AgUbZj@hKknA|T}n@{Hse@f\\oc@Sc{AhSWjQjXt_@yLna@zHxSl{@pCf_@nP|@vZ|p@~Cph@dSny@hBzt@hVeBl`@lH{@bGkKbSmAlk@mLlOnNpGyEd`BwNhCiVzx@tFdVla@lo@dm@h[wIj\\`IzZoJuNyE}ImTcP}RlCeJaL_DeEtGyc@x@qOsCtJiEmCiHxT}N`HcYvUeIoCeTf[yOtXkA`m@mRph@dE|MdHjY?tNrMbm@~DjTpH~[gN`g@Gte@{E|YjLjCwOta@_PeKeXiPiOsLtBbOc[yw@_s@_^gFuEoPl^qu@{\\mAga@}Omo@m@c~@|CwdA~Mgp@f@oV~GmV{IkOrMkw@_B{W~D_Cm^iRuLst@wB',
        ],
    ],
    [
        ['Belarus', 'Belarus', 'BLR', null],
        0,
        [
            'a`v@qulBy`AtN{GnNw_@mFc|@zMcEh\\jLzOcf@|g@mXjJvBhJei@~I_QtOhWrLlq@cA`KxDuMvSkN~f@??rt@vBhRtL~Bl^zW_Ejw@~AjOsMlVzInV_Hfp@g@vdA_Nb~@}Clo@l@fa@|Oz\\lAd@{ZhR}[od@wKK}WhPwVvAsZm{@JybAoVoMib@gr@_SzD_[_e@oIebAcW',
        ],
    ],
    [
        ['Lithuania', 'Lithuania', 'LTU', null],
        0,
        [
            '{vr@}rkB{D~Zfr@~RnMhb@xbAnVl{@K~MiR`_@uE~C}NuEcPrZ{Hn`A}IfLqs@qfAeRygB~Bm|@eEwG~Kg`@`Ca{@h]',
        ],
    ],
    [
        ['Russia', 'Russia', 'RUS', null],
        1,
        [
            ['ia|IuziCunAaY?vi@pcAdBbJ{R'],
            [
                'y{~A}ryAn[`d@p{@hIb}@n_Ayw@hz@bE`i@ecArhA??hd@dXtI|NtZiC|i@}d@pPcAhf@mMbRuXfy@aL|d@xH|IsJbtA}\\~zAcIxs@uIrFjFtnAys@hfAqV~t@wc@ol@_I{r@gs@|a@wWc{AoXt@sL`w@`I}@wZg_@oPm{@qC{HySxLoa@kXu_@VkQb{AiSnc@Rre@g\\|n@zHjnA}Tk@iKfUcZxp@_BdDkRsNuK|f@kb@x_A`E~QeBxNfMhVqA??jN_g@tMwSaKyDmq@bAiWsL~PuOdi@_JwBiJlXkJbf@}g@kL{ObEi\\b|@{Mv_@lFzGoNx`AuNbS{c@hDi]b]mMyYyRpQiy@ok@_c@lH{I??afAqa@n`Aw\\??ydCwnAay@cc@oV{^n{Ayi@qXug@hw@qm@ci@qt@tgAcfAsx@cn@t~Auh@cHwj@oq@wDiiBaX??o_AwTseBxd@ejDzMckFteA_o@t\\cCph@jdAz_@`eBrO~uGon@|l@|F}dBxl@_C~[aCz~@moA`R{o@dOaGi]rd@yYwf@uVavCze@us@eN`i@yl@spCe|@ux@pBky@zTkc@}i@bs@gd@s]md@|l@we@ymD`Sub@~a@bnAtFMxa@ep@jTq_BqLiNyf@qaCy\\ayEst@en@`Br|@|d@olAnEyk@kTctBu@y{A}XefAtd@afAmh@n`Aec@o_@sSswD|QouAnRoaFlfAyh@w_@p~@_`@x@gLhjAeEsSs\\l`@wo@z@_SirBsw@_h@ww@om@iKodDnO_Lva@fz@tq@{e@|RcStj@dMrtA}cAhe@xYvh@lyBvwAmfAdH{WoUwcA_OsO}]au@w\\lc@qb@e\\gh@jcAcD~Mya@{p@w}@dpA}q@{nBci@nMmk@e^m@{_@ra@tWh{@{aAlJn[al@sgBqWu`CiBorBrb@pv@as@fEqaAukBsKiuCvAmfCeGvq@u_@igA_h@yfAw@oxB_^adDiGyScPccDyDcr@`MikCg`@yqB`@eP_Zwz@sYqrCsXejBfSbtAlNqlCpH{Oz]cx@eNuuDX}kCn]cq@jVpNn_@bdAnQfcDta@|m@pQolAvGm{AvNiw@yJ{^bg@mZgO}bB{HogEhIgNf\\idGhHqBwn@scC|IwbBI}cBz_@y[~f@~c@dYomAdp@iaBjXi{@q`AgcBb[oiByO_xBdR_m@oPgeBvGbl@_y@oqAaZosPpg@et@bd@sbDvn@k{FyJm{BfI_s@zXpFtl@_lAxPsrAyKymBs@_uBfKouB}E{kBpv@mlA_Spq@}f@yZwZmfEnP_aCwBwrDx\\ovAfZ?~wFLJjoAlZ~oAqCkw@f`@ed@nr@{[xOgFzXbOpOnsBsLtmD`n@pv@fFr~A|j@tyAje@~Uj[lxAgj@xaD`p@l[eVd{@vYrrAqGbSbh@~iAn{@gAfXefA~LjG~yA~x@hAxYfs@_Y|YflB|^tThfAd|AfNvQn~@`yAfy@bVaj@vYezAza@{iC_]uuAws@id@gBe\\c`B_MunBumAqjBg_AkoB{p@gq@cwA~jAhDnd@lr@p}CtcAdr@{kAh`DfTl{CvgBsr@he@njChOr_BlEoCel@b`BoHllAv]b~DwIplEnQniE~xBnnFjrCoaBzFu]df@w{@zL_g@g^qcA`CeyAvcAcAdt@zo@l}@fDriAd[|bBd}AlyA|Sfj@zsAvgAdsAdgAjg@|c@frAtc@lf@Xff@m]zrAvl@vHxS??????vG}I??Jw^}^u@_H{hAnOot@st@aU{jA`Jai@y{@kTmcAiW{Uy_@gw@ffBlQdu@rW~}AAhXwy@~hAmk@xkB}RbVg|@vTke@lV{Yre@a~@zu@_Vp|AsQxqAt@tlAhJrr@`^ia@zMWna@va@~Rlw@haAQnZ`wAnf@~iAsVpiAfDv_@}Snd@wEnzA~j@hqAjIlx@nNvmAeI|x@R|d@}^d|@_]r}@gG`nAdG`z@pJxwAiY|Jym@nhAaOtw@iF`eAyXt_Av_AkXxc@v{@nj@jyAuNj}@gAvh@g\\f`A[hu@eR`~Aj\\fvBxt@|`AzIlWbDd`@ge@noAjGpYoYvj@cK`]cc@na@gJxxA`ObuA_c@f`@t_@tjCu}CvnAio@{UsRr{C~y@|z@pBeDca@hoAiTf`AfNtRy_AhoBmLdw@|Xj{C`Vn]lNzhFvTt[hTcl@xi@~z@fOuJ~O|z@n]gdB|i@tNr\\vvAuAdQpQ|nAm_@`bBf@haAjY~hAgXvhCij@r`Br@``C~bAvFrl@h_Agc@xp@tcAgQvKbc@jn@at@ji@km@w@{f@vh@jEd_@w^bI',
            ],
            ['cdvDag}CefCaMmxBl^}nCl{@lNdw@jgCxF`mDaQvfB{V~n@yk@ftAiKiaDwi@'],
            ['kzgEazyCk}Cnb@pQjXh_JbWeqBaqAir@_F_n@`C'],
            ['}cnGqusCadDvA{`Fb`@bp@lm@jeFw@tfBxMxzBug@s`@}i@mqAwJ'],
            ['{n`HcdrC{{CjOfgAtW|bBqDbsBuW}MgSosBlH'],
            ['mdpGshnCiz@uWcmAyDywA|VqFlOv}ALb_C_F|IiB'],
            [
                '}qvA{k|C_yBkJ}}AWyKxO{b@}M}y@iIu{AtLdWpHzrAfGfw@tCtGhI`hAhItbAyMqb@oR`jC}@',
            ],
            ['ukk@obiB|qB\\|kAaFeMoZguAgSo`A|IsZzHtEbP_D|N'],
            [
                'gogBk`oCstCyu@zOk[yjC_`@imEeg@_oEuJajBeVsxBcGmj@tW|h@lRn|E~]x}Dx\\daEnz@b|A~{@~`Bb{@wKzr@qvBhr@|c@lDfkEcGpOwZbpBwObHw`@{~@kLbAca@_{Bit@nx@sF',
            ],
            [
                'ecvGq{gBsTf{@r@n|@yX`~@{}@vmBn{AuSle@hyA{{@`_Av@tj@hn@ud@~g@jo@pJms@}E{{@bFmbAoMgn@wAqrArc@m|@qDmtAwx@w[xW}[yZyGgOhh@',
            ],
            [
                '~stIkgbCjDze@ci@nNnMkl@uhDhHiyBny@||@fZleBlEp@`|@~W~Kpy@{@rn@wTbrAgQ|LcZn~@eI`fA`G|`@yTqLgVziAxMe[l\\lb@nY?_xFcxCvn@{bDb}@',
            ],
            ['j_|IymiCrpAxB?wi@_GsA_t@BkyA|PjDnGj_A~M'],
            [
                'wh`AgxxAmOoNmk@lLcSlAcGjKmHz@OlDq]`Nw~@wBdKhUlcAxIxsAdc@xa@wKyLk\\hcAgQaJ_Kyz@ySnHoF',
            ],
        ],
    ],
    [
        ['Czechia', 'Czechia', 'CZE', null],
        0,
        [
            'qi\\eybBs\\bSwm@lD|BdP}`@|KkHcO{i@~E{DpRom@vBw[x]rQ@tHfJjMtA`CfM|J~Av@xDhTlEtZa@zGvLx[yJh\\fBpo@aR~TtCbb@pXlm@cShb@{Yz^_NrEkY|IqQml@sLeVqN{k@cKuN{JoOdF{ZqE',
        ],
    ],
    [
        ['Germany', 'Germany', 'DEU', null],
        0,
        [
            'oqZy~gBqMx^jPtOuUfUmNl`@zCpTsXzf@zZpEnOeFtNzJzk@bKdVpNll@rL}IpQsEjY{^~Mib@zY`Ux[lU|F{Gtg@xDrInRwK~\\}@tk@dJ`v@sA|GnOr^kPzQlB|aAcRzKpLbt@M}Fok@q^yi@`yAoJn\\kOqBkZnKcMcFgi@nIo`Aod@?{NoVqNgx@tJcTeKgLgs@kBsJvLmi@y]hMmVzAmb@gn@fG_g@oHc@bWc~@pMTdUq~@uJcb@cPqeArWq\\|R',
        ],
    ],
    [
        ['Estonia', 'Estonia', 'EST', null],
        0,
        [
            'ysu@edsB??mHzInk@~b@qQhy@xYxRnr@Axt@gVjZsFft@`JgF{c@~UzFrf@gUlD{b@_nAmPwmAaHybAhIo_Ay@??',
        ],
    ],
    [
        ['Latvia', 'Latvia', 'LVA', null],
        0,
        [
            'oht@egoBc]lMiDh]cSzc@dbAbW~d@nI`{@i]f`@aCvG_Ll|@dExgB_CpfAdRcAan@w]gf@{y@iTsp@tm@eq@g@_K}n@gt@aJkZrFyt@fVor@@',
        ],
    ],
    [
        ['Norway', 'Norway', '-99', null],
        1,
        [
            [
                'mq\\srzCwVkTwzAeAymAxTwlErm@h|CpWta@~l@zu@xJv\\xr@hjAlAjeCce@uw@gUt|AaQxxBws@po@}o@kiDkUga@zT_xA[',
            ],
            [
                'yv{@kzfChiB`Xnq@vDoYyj@foA{W~_BdTt]xl@pz@rZbbAaNrpA`BldA_`@ld@nOxe@pAbHbh@xtB_IpOva@~z@Efh@nk@p}@fdA~_B|vAwUjTvTvW~|@a@pg@ry@yB~qA}f@r^tSnhA~r@zi@pZ~b@zh@ke@lzBhgAhrArMluAy^jUebAvRgoCqx@eg@_dDos@mzBo_AkqBcvAeuCuwBugB_n@wjDkmAchCkZ{eBhBe~Awr@}pBvAgoBmKmbEtl@noAvOocAff@',
            ],
            ['_pt@oj{Ct{Ar`@htDjFhwDmIbJePtxAc@jcAu[_`EmPwyA~Me~@uQa}CrNoyB|T'],
            ['gho@{`wCrjCpXfmBoMcj@cOvd@_So`CoKyWlVeyAbM'],
        ],
    ],
    [
        ['Sweden', 'Sweden', 'SWE', null],
        0,
        [
            'epTo}qBqZ_c@_s@{i@uSohA|f@s^xB_rAqg@sy@_}@`@wTwWvUkT_`B}vAq}@gdAgh@ok@_{@DqOwa@ytB~HcHch@ye@qAirAp]o`Bpi@u@f_BaThWnjBtPp{@rj@wHfe@lbBfq@twBxt@nl@~vAmk@~j@yz@ta@lx@neA~_ArMxV|gBnb@py@xjAaEjb@pp@jgAzAzRaz@hs@}eApn@kwA',
        ],
    ],
    [
        ['Finland', 'Finland', 'FIN', null],
        0,
        [
            '_zv@q{eCbHvj@u~Ath@rx@bn@ugAbfAbi@pt@iw@pm@pXtg@o{Axi@nVz^`y@bc@xdCvnA????lpB~CzlB|UtdBdLdc@ca@p{@oS}Lq|@j]kw@y\\mc@uw@gf@_nCwbAuh@aLnEmY|uAq\\`TiWt@g_Bn`Bqi@hrAq]md@oOmdA~_@spAaBcbA`Nqz@sZu]yl@_`BeTgoAzWnYxj@',
        ],
    ],
    [
        ['Luxembourg', 'Luxembourg', 'LUX', null],
        0,
        ['uxJ_|`BoKbMpBjZ~Ph@~LkDwEab@iOkA'],
    ],
    [
        ['Belgium', 'Belgium', 'BEL', null],
        0,
        [
            'y_KgfbBbFfi@hOjAvE`b@tu@o[`_@zCrj@o\\`\\aX`\\a@~G_Uaq@iK????wl@|C}x@_Lqf@jZka@pM',
        ],
    ],
    [
        ['North Macedonia', 'North Macedonia', 'MKD', null],
        0,
        [
            'yuj@_tqAg^`SmChh@zJ`AhI|Iz`@g@xVtLzg@nD|XeNzGyY}FgT??}FNyAyK}c@uH_MkAgTuB_\\_@',
        ],
    ],
    [
        ['Albania', 'Albania', 'ALB', null],
        0,
        [
            'w`h@uwnAf@lOhS`HvBhS`\\h]rIkCf@wLra@_TlDw\\iDui@oGkRnI{H??fC{RcZw]_CvJyOqDiLxO}MjEeCtU??|FfT{GxY}XdN',
        ],
    ],
    [
        ['Kosovo', 'Kosovo', '-99', null],
        0,
        [
            '{eg@}vpAdCuU|MkEhLyOuJ_M}MoCsGwSeJmB}GxGsJzBeG|HiI|AcKrJ{GK~EfNnFlFcAtC~LjA|c@tHxAxK|FO',
        ],
    ],
    [
        ['Spain', 'Spain', 'ESP', null],
        0,
        [
            'zpMsmgAdDuScVmVsG_PpTqQgPah@`Xod@_ZcDqAq\\cIcHYwo@{[}OnPi^jc@eAvIzFzc@@tNq]nX`HtUzNeBok@pXcZmwAal@okAfJ{rAKoaAtI{r@iBadB`A{WhWarBj[wUoLieAh[mgAcGiBhc@dz@rh@`oAdLrD`Tje@ra@bWzq@kWtb@bc@|ZnLrg@dn@lKfk@`o@jnA\\pz@e@bf@`UzVrVp]eDdVcTtP}b@jy@uH',
        ],
    ],
    [
        ['Denmark', 'Denmark', 'DNK', null],
        1,
        [
            [
                'ckRmkjB~f@nHfn@gGjXua@z@{~@mI{O{PwQav@{B_UgPgq@sPbAb_@nQjSoFnP{`@lHfNrVrQyE~k@~k@_Pl]',
            ],
            ['edW}qlB}Rh^nd@rq@j`Aib@vG}XuzAuS'],
        ],
    ],
    [
        ['Romania', 'Romania', 'ROU', null],
        0,
        [
            'scv@_zwA{ZnJk\\aIi[vIo@bOh]lL~Q{DnPljAvc@qEnl@wUphApM~]|NvzAiB`o@wHdWpC~PuXlJ{IoMqIlNyFrR`Mlc@eQzCwXbe@uM~E}Rz`@oWcq@yJyd@ki@q\\ki@ee@cL}YkLue@zEag@F_\\fNkTqHcm@_EuNsMkY?aRbEkRnQyRjYac@dd@_AjZrEtYgJp[',
        ],
    ],
    [
        ['Hungary', 'Hungary', 'HUN', null],
        0,
        [
            'kcj@kq}Aua@~OkCvOde@bLp\\ji@xd@ji@bq@xJ~e@yAzn@lO??jVjHrr@aKtm@yYzRuFbKaTpIUwSgg@`KqLeb@CwCoXw^~NaVxEos@uF_DqKyWy@m]wHwE~Bk\\yFuMuMmSyB}aA~QkLkE',
        ],
    ],
    [
        ['Slovakia', 'Slovakia', 'SVK', null],
        0,
        [
            '{`k@{z~AhPhOdKdXjLjE|aA_RlSxBtMtMj\\xFvE_Cl]vHxWx@~CpKns@tF`VyEv^_OfEuT_D}F{GwLuZ`@iTmEw@yD}J_BaCgMkMuAuHgJsQAqBvBuXoGo^dU}c@kLo\\jE_l@yGkz@~V',
        ],
    ],
    [
        ['Poland', 'Poland', 'POL', null],
        0,
        [
            'wzl@ohhBwArZiPvVJ|Wnd@vKiR|[e@zZm^pu@tEnP~]fFxw@~r@cOb[rLuBjz@_W~k@xGn\\kE|c@jLn^eUtXnGpBwBv[y]nm@wBzDqRzi@_FjHbO|`@}K}BePvm@mDr\\cSrX{f@{CqTlNm`@tUgUkPuOpMy^ui@kQo`B{[wmAeTk}@pIuCfNi{@X}kA`F}qB]a_@tE_NhR',
        ],
    ],
    [
        ['Ireland', 'Ireland', 'IRL', null],
        0,
        [
            'jbKwehBiItk@fn@xv@xmB|c@lwAmHuq@i`At_@o~@atA_p@gn@e\\{Kn`@zKn`@se@[gn@zK',
        ],
    ],
    [
        ['United Kingdom', 'United Kingdom', 'GBR', null],
        1,
        [
            ['jbKwehBfn@{Kre@Z{Ko`@zKo`@ks@qA_bAre@n`@|i@'],
            [
                'j`EyhgBC@eHic@zh@oe@\\[zjA_J|M}OwU{ZpSgPr`@p\\tBg{@p^{^uUs_Aqo@uq@}p@|CkjAgDxaArbAu~@qGocAHhO|q@dw@~v@s_A~B}CpEuv@vhAyi@`Ime@dfAyPtWwjAzJrF~f@x^hQ}Wj_@fw@t_@rrAQjiBdPb\\iKhh@h\\zx@cFzj@zVf`@oKuzAs`A}v@oLNAp`BkItP{Wi`AkRfa@u`@{J}g@{{ArD',
            ],
        ],
    ],
    [
        ['Greece', 'Greece', 'GRC', null],
        1,
        [
            ['cjr@g}cAxFlQ~xAhDSiIfkAeKqJqYea@`Tso@qBom@lCn@zIaa@oF'],
            [
                'oyk@svoAgm@x@aq@eP_k@zTyw@}DUc^m]pOhRbf@zM~E`e@y@r_@{DtjAfOij@bb@v^dIxa@@``@e_@vJtL_Mjd@g^h\\pVtLya@x[}]bQ]hb@xx@qOmQz^tf@pEuVbv@nh@Xfr@eZlV_q@|Iqh@jWw[~^sb@fCyPa\\i]wBiSiSaHg@mO{g@oDyVuL{`@f@iI}I{JaA',
            ],
        ],
    ],
    [
        ['Austria', 'Austria', 'AUT', null],
        0,
        [
            'gd`@u~|AvCnXdb@BaKpLvSfg@zJnItu@p@p^dMrr@yCjxAeO|LuTv|@xIfF|Jzd@}G|^u@f[kJqHiNlAaJ{QmBs^jP}GoOav@rAuk@eJ_]|@oRvKyDsIzGug@mU}FaUy[mm@bScb@qX_UuCqo@`Ri\\gBy[xJ~C|FgEtT',
        ],
    ],
    [
        ['Italy', 'Italy', 'ITA', null],
        1,
        [
            [
                'ukS{qzA{d@|GgF}Jw|@yI}LtTkxAdOvEv]_NrYvp@cHxq@dUmB`^tFxPoSx^sy@l^m^tr@qdAjq@}o@KgNxLpPlK_w@pU{l@|Qst@p_@mEtJtJjUta@e\\fu@gIhYlg@cl@bVjFr_@bYtBj`@rt@`YxCGcRwKo`@qLkLjWec@`Ro^~XyFlQ_Zbg@iJ`ZcXfm@aCxo@g[dx@sg@ni@_c@nRy|@b^gFxq@sSv[lGbc@~[~XpCeFcZz`@}FbOko@uT_RlQoVsAsP{YjLc]}Aab@gTyI|Hw\\_AqLeXgm@xFoZqI_DsX',
            ],
            ['qy[_oiAmn@mDnUdp@kHjRbLb_@xn@qVv^wEfvAw^wGa_@chAtDw~@yE'],
            ['k_Pg{nAg^kRod@jk@vGtqAl[}BnXxStVqOnAkjAfMwb@ka@bB'],
        ],
    ],
    [
        ['Switzerland', 'Switzerland', 'CHE', null],
        0,
        [
            'svQiy{AmA`JpHhNg[jJ}^t@~CrXnZpIfm@yFpLdXv\\~@xI}H`b@fTb]|AzYkLnTmZx\\xH[i[wl@cb@~@{Nm[vDePuIct@L{KqL}aAbR',
        ],
    ],
    [
        ['Netherlands', 'Netherlands', 'NLD', null],
        0,
        [
            'qnLsmgBuJbTpNfx@zNnVnd@?oIn`Aja@qMpf@kZ|x@~Kvl@}C??e_@ePwu@}zAotAcY}r@v@',
        ],
    ],
    [
        ['Serbia', 'Republic of Serbia', 'SRB', null],
        0,
        [
            '{wc@itxA??{n@mO_f@xA{`@nW_F|Rce@tM{CvXmc@dQsRaMmNxFnMpImJzIlNdMsDxUk]~YxVnRnI|RwElFfIxG~[^fTtBbAuCoFmF_FgNzGJbKsJhI}AdG}HrJ{B|GyGdJlBrGvS|MnCcDkDxV}KpSwEbHsGpOwIuMwAcHk\\b]aWsNoZtUD??aWqVxRyPdNeW',
        ],
    ],
    [
        ['Croatia', 'Croatia', 'HRV', null],
        0,
        [
            'ij_@oyyA{RtFum@xYsr@`KkVkHeNdWyRxP`WpVf[{Ldj@Zvt@kId\\j@pL~KlUkM`L|Xs]f\\oLjRw[hVyVzLsV`Yiv@tVzErI??vy@cVfc@oUdx@qQps@_m@sKuCn[gYb@cTdg@{HdR~YlQ}Sk@uTgA_@qj@bAmJqIgTdIqWf@FoPwTkEaEgXwp@sO',
        ],
    ],
    [
        ['Slovenia', 'Slovenia', 'SVN', null],
        0,
        [
            '{}YyyyAsr@xCq^eMuu@q@{JoIqITcK`Tvp@rO`EfXvTjEGnPpWg@fTeIlJpIpj@cA}LuD~MsYwEw]',
        ],
    ],
    [
        ['Bulgaria', 'Bulgaria', 'BGR', null],
        0,
        [
            'agk@ukuA_QtXeWqCao@vHwzAhB_^}NqhAqMol@vUwc@pEl_@zXxUtk@eStb@xt@kGt~@rRTb^xw@|D~j@{T`q@dPfm@y@lCih@f^aSgIyGvEmFoI}RyVoRj]_ZrDyUmNeM',
        ],
    ],
    [
        ['Montenegro', 'Montenegro', 'MNE', null],
        0,
        [
            'mef@ydrAxOpD~BwJbZv]gCzRbLyCnPmS~YkK{EsIcHka@kSqMuJuDqOvIcHrGqSvEyV|KbDjDtJ~L',
        ],
    ],
    [
        ['Bosnia and Herz.', 'Bosnia and Herzegovina', 'BIH', null],
        0,
        [
            '_gc@shrAhv@uVrVaYxV{Lv[iVnLkRr]g\\aL}XmUjMqL_Le\\k@wt@jIej@[g[zL??uUErNnZc]`WbHj\\tMvAtJtDjSpMbHja@',
        ],
    ],
    [
        ['Portugal', 'Portugal', 'PRT', null],
        0,
        [
            'tsPqxpAuU{NoXaHuNp]{c@AwI{Fkc@dAoPh^z[|OXvo@bIbHpAp\\~YbDaXnd@fP`h@qTpQrG~ObVlVeDtSbXfO|_@yGf_@zEqH{o@zDme@|ZwD~MuV_D}g@}WuUmCgX_Lsd@j@mYnKmUvAcT',
        ],
    ],
    [
        ['Moldova', 'Moldova', 'MDA', null],
        0,
        [
            'u~r@yd}A}MeHqh@eEam@lRuXjAg[xOnCdTwUdIaHbYyT|NlChHuJhEpOrCxc@y@dEuG`L~CmCdJbP|R|IlTtNxEfJq[sEuY~@kZ`c@ed@xRkYjRoQ`RcE',
        ],
    ],
    [
        ['Iceland', 'Iceland', 'ISL', null],
        0,
        [
            'xi[ox`ClMlg@seAri@fpAtn@fsDxi@zt@lJhqAgHjmDwRq|@sZ`gCq]umBcKtAkQdbCoMei@wg@w}AeHm`Bji@}}Aaa@smAtP}dBi`@ufBlC',
        ],
    ],
    [
        ['Papua New Guinea', 'Papua New Guinea', 'PNG', null],
        1,
        [
            [
                'okrGnaDmkB`j@qrBvb@aj@`_@ya@j^oHzc@cgBre@eNb`@nx@vEyLrh@yv@~g@qg@haAyb@cAnAtZgo@rIvQxJmaAhY|E`Qlh@hCjNeOtt@_Fb~@mHro@{f@lb@ia@n_@wu@npAiZ|s@xPde@rS_Gbm@bp@nT~a@mIr_AsA`@ujE`@ujE',
            ],
            [
                '_ciHvcFwV~RoFn_@pRrOvJ{c@pMcWh[oSpb@uYbl@kQkPaNw`@nPgTvLgY~M_XfY',
            ],
            [
                'iofH`lJda@dN`_@rMd`@Afr@eQtb@mPeDiR_w@bHga@{CkH_]_Hq@aEd`@sb@wCuPkT{a@iUzEyc@md@e@sKfIf@ta@~Sbe@v_@bDzHpP',
            ],
            ['ogmHvlI}QdMi]rf@o\\dTvGnPnPfE`Z_WjZuf@lLsn@uGaEuErQ'],
        ],
    ],
    [
        ['Australia', 'Australia', 'AUS', null],
        1,
        [
            [
                'qm_HnunAod@dCmCdiAlTpTlEhq@xTcPlj@pj@|KkBle@}@ne@ot@pGgh@`c@mu@s@u[{g@pDk{@pTaa@qGwo@aK',
            ],
            [
                'ikuFn|}@faA`_@du@jM`Kx_@`VjX`t@n@ff@pDfv@kJ|k@xEzi@zAdd@h`@fQyAh^tP`]zRpl@oA|h@?haA}f@p`@yJk@{b@_^oGsIeMfAoUuFmj@~Ead@``@c~@fIub@uAsb@zWug@r@kQrZ{WxF}o@vb@op@rGsYmZ~Y`T_y@_^bQoQdW`@__@|]ep@~DuRlMuQwEec@yKkNoGg^rEqc@yX}k@uCpn@mY}i@wq@}Sm]sYyn@}Uk[{CgPtFgp@iV{d@}EoHuLoOuDqa@n@u`AiQ_a@wZ}Nm`@uc@u^yA}Ws@_a@wj@ct@iY~t@qYoKfUo\\sRk]qZpLsFqn@ca@w]aNuWm^sI_@mPmZfFc@uNoZ}Ge]mGem@t[ua@~c@cf@Luf@zDdLia@}\\cq@c[kOtHqNcZwb@yd@_U__@jFos@wJb@}^vl@qSg`@aHmh@lNe`@tXss@|N{PiEue@fRqc@}PmVlDsM_Kw[|]tOl`@vVfXlTbAgF|WjQf^dUt]mCtPup@na@co@`Se_@nTel@`d@sPAw_@~NoHhRsz@dTgh@kTgKq`@uKuZwFga@_Rwp@tGg]qCeQfFwb@eGan@_KuKvH{ScNe`@yJia@s@yPeVmVsPp]kCff@qNpFuAfYuUv^uCjb@dAvUoU~o@cg@qVuSlY_]lWlEtZiLrt@oHd^wNrF}Olt@~Dj_@eSji@wbAt_@ek@t\\{h@dZdGbNwb@ff@iWrbA}WwLkX`ZgNsHyIfaAik@je@a\\zVyo@rq@qPdq@s@rb@hCte@w\\bt@pBhv@xI|[zOvv@i@zb@jKvk@rZzw@hm@t]xUlo@xSz]pQ|t@bWd^xNvm@`G`j@eBvRxb@vT|dAfAtx@rXv[fWvd@xYvr@sZhe@aJuHq_@ba@xJvu@fl@`u@}Olb@{Htb@mCn{@cQlg@oe@pJmn@pMs^t]iXb{@qFoSi]`Nkm@p]fj@rv@nJu_@sa@oHac@cWs]~Cgm@xq@ht@`f@jT|Vtp@xo@uX}@e`@bf@il@|_@mVwJmMdoA{d@|j@w@b{@m]znBzD|oAjUbfAzSrz@cC',
            ],
        ],
    ],
    [
        ['Fiji', 'Fiji', 'FJI', null],
        1,
        [
            ['_q~Idk^?n]vf@jN|f@dL~FiVg^yKyRmBsc@oR'],
            ['{{zI`ea@oNiIoT~PhIt_@ve@pGna@wF~DmZcWoTm[vF'],
            ['`d~Ihh^vF`]dDhB?o]}K{A'],
        ],
    ],
    [
        ['New Zealand', 'New Zealand', 'NZL', null],
        1,
        [
            [
                'knxIbgmArVt`@~]xi@fo@zWvIkO`Y_Hac@mr@nSka@fbA_Xw@sUel@yToIco@zAmg@hX{h@u@_Jz\\yXdp@iv@bYgk@eV{C_a@ta@so@dOuPtv@il@x`Ai@ui@e[`PiHfn@iq@jSgi@~Cub@yVu^dFbNnv@`Rlc@tn@g@tO~QyDzYdHrJ',
            ],
            [
                'gkjIdatAqt@u_@od@m_@yZsm@uVyNgH{a@{j@{[yLpYeMxXmk@iXcQjYAhYhV|[xg@`m@~^bXaV`]do@Xnt@pVvOzg@nb@f~@bp@|Zd^xPpx@i@lg@sS|bAkCnI}Uq`@km@smAu|@ig@wJ}k@yV',
            ],
        ],
    ],
    [
        ['New Caledonia', 'New Caledonia', 'NCL', null],
        0,
        ['gxbIndh@gr@ve@o_@v[vV~Mja@{Ovk@c[fg@c`@jh@ak@rGeT{YZ_b@fToZfT_SnP'],
    ],
    [
        ['Solomon Is.', 'Solomon Islands', 'SLB', null],
        1,
        [
            ['ms{HdnSoPlTtj@KvVme@id@bNsKfA'],
            ['_xzH~vQlHnJhm@cu@~Kkd@gT?oU~p@_X~\\'],
            ['gdyH`hRhWj@je@iE`LsH}ByWgh@xHkSbLeIlO'],
            ['oxvHftNuMxRsApK|o@oYfa@mUlVySiHkEw[~Mgr@v['],
            ['g|qHzuL{WjSlKpBhZgMtXuXgBmIid@lY'],
        ],
    ],
    [
        ['Vanuatu', 'Vanuatu', 'VUT', null],
        1,
        [['areIf`^gf@zb@rSfG|SkZiAwO'], ['qwdIhr]|GgPh@}n@}\\fRcIjq@xOyF~KjB']],
    ],
    [
        ['Antarctica', 'Antarctica', 'ATA', null],
        1,
        [
            [
                'h`~A|lwC{^?_|AoLg}AnLclA|Y}Y~d@kF|YmAx^v_BrRpdBzNntBtM~aCfKbsCsB~pAyS_JwXmdCcP{t@yScf@_Ze[gV}d@_Ukg@wX??',
            ],
            [
                'bn`C~v{CwkClAueCbEom@wXa`@_U{_AtXjQz^jQb[|aCqGpjCtBjmAyS?mAfa@kQ',
            ],
            [
                'vjoChejC??{i@iFegAlAkQ{^uBgVf@eq@ob@m\\qx@wHa`@fVuMfV{Yd[yS|YePd[iFb[~InWbPhVlhApGxdAfK~pAg@s]oWnhApGvdArGvn@kQtBwXqcAoW',
            ],
            [
                'tzfEjlkC??ef@_JqnApGqyAzCqcArGqcAkFwc@nb@~o@{CzjAlAblAmAlsAtBt~@gK``@wX',
            ],
            ['znnFrznC??oLySsiA~IyoAxHuiAaJnb@`Uvy@|N|uA}Cl}@_U'],
            ['drwFjnnC??il@oLk}@tMo~AnWtc@mAxoAcEttAcP'],
            ['`w~HfoxC??}d@iVisBxHm}@rRwn@~TcPd[~vBpG~pAaUtc@_UnAuBjg@cP'],
            [
                '_q~IpmdD?liI~b~T??miIsBNev@kc@soBrRgFeA_aA}RsGTiFNmyA~XcnA_YgMqBsvD_Jmz@pMk\\lFg}AxSopD|NwkCrRepFtM}rDcPshGfKquCpRgdDkQylDcPoLm\\`uFmA~hEuMrs@oWtfDmL_Je[gVuXgViVfKuX~fBePvn@_Ut_BsRwvCtBmoCyHsyAxSknBkQyeBgVeq@yS~TwXxoAcPxzAkQn_CuBroBqGdxBcElg@gVvoAsR~o@_UpRafAs]bEgw@rR{eBcEcbBqGmr@|YcbBcEgrAoLkmAcP_fAySg}AcEnAiV~TgVkQaUwoA_Jwc@xSo~AgKegA}NkxAe@msAcEosAuMibAoL{jAmL_p@rByi@|Ca|AqGgrA~IutAg@_qAqGmsAbEa|AbE}uAmAqyAf@_|Ad@utAmAu~@kQ{jAyHkmAnLsiA_JkbAaUkg@pRaU`Ukg@xS{_AkQuiAhVmsAhFggAbPcwAsBqnAaJg}AlAmsArGutA~Ia`@}Yjg@ySr]aUvoA{Cnb@iVnLgV~Tom@wn@pG_qArBwoAsBohAvHs~@jQ}Y`UmsAtByoAqGutAgKclAkFs~@tMgrA{C{t@wn@eq@b[ggA`JimAcEmr@nW_qAlA{jAhFuiAnL_p@gVmWaUm}@nWutAcEu~@lLyi@zSgrAcE{_AoLs~@}N}jAqGcwAiFqnAsGe|@mLwc@sRuM}YjFuXpRoW~ToWrRoWzNaUtBoWcEmWk\\iVoWuXwHoWfK}YhFoWq]e[ia@kQkg@gV{i@sReq@iQmW_Zia@cPef@}N}z@sBef@sRak@gKmr@iFgl@}Nob@sR_p@iFuc@zNfVzSr~@hQ|YnLnm@yHlr@bExi@tMhl@|Nr]jQpGnWuBfVk\\xSzi@vMvy@zCfa@xSvc@pRbf@~YxHfV_UtXa`@rRmr@tMwn@rRuXlWmLhVkQnWk\\xSkQfVqGpx@kQfV{CnWsRnWpG``@ha@vXtc@xSfrApGd[`U|d@xSf}AfVfrAxHhmAlLnsAnLdq@tXjcBnAdmBoAbbB|CfhB?qRnWo~A~IwdAbPef@`UxdArRtjBcEjxAzNtBvXlAnWmhAxSoLfVqnAhVecCvHsoBdPkxApRypBrRozCvH_xCdPoiBjQisBxSe|@j\\s]fV{jA_UyeBkQ}kBsRw`C{NmnBePmzCe@_xCpGc}BtMkg@}Y}uAkQ{|Cg@szBmLqtBoLw`CqGiiC_Ju_B}N`k@aU|Y_U?iVdxBlAn_CxHlyB?bPgVqGqm@c[mLkxAuMihBwM{jAiQ{jAkQiw@oWutAaJosAqGyi@{Cu_BmAyzAsGclAgK}jAuMocAuM}uAqRav@ySyy@kQiQoW`aAuM_UwXsh@qR{_AgKqcAwMs~@qR_p@oWs]k\\gl@ePuiAtBs]xSsiAnAoAiVy^oWibAbE}NhVsiArByoA_JkmAkF_fAtB{YvXqcAySu~@aJ_fAqGwdAqGu~@uMwdAyH{t@mL}d@aUom@|N{_AsGil@l\\ob@~T_fAgKc[mWu~@eP_qAtBoWfVkr@gVkbAkFmhAmAaaAf@ydAhFibAtBk\\xSkg@jQqcA_JmhAmA_fA?ydAg@m}@qGaaAkFcv@cPwy@_Js~@cEwn@ePga@ga@ob@yS{_AvHoW`U{t@tM{_A{Cak@~Tom@|Nu~@uM_U}Yiw@_J{_AySg|@sGmhAgK}o@mLmr@uM}o@oLwy@jFiw@aUmg@cPwy@d@kr@uMgKaUus@cPkr@gKm}@yHqx@{Cav@tBwy@bEeq@bPcE|Yav@xS_e@dPsiAhFsh@dPmr@bP}z@tBeq@gK{t@wXwy@nLg|@hFwy@jFe|@zCm}@?mr@|_AnA|NhFb[~z@|N|o@fVqGnWwdAe@pGlWx^hVj\\tXwn@rRegAbEggAaJga@mWySiVia@qRcf@kQ}NaUa`@s]ef@cE_fAmAk}@kFu~@wHs]oWiQiV{i@gVe|@{Nss@gKia@{Sob@_Jgl@yHm}@bEiw@cEg|@iFocArBil@cPy^sh@gVbPk\\l\\us@dK}z@|C_{@kFu~@|Cwy@d@cf@cEus@tBun@nLiw@qGkbA?ox@sG{_ArGsh@{Sy^yS{i@cPimAqm@mg@pGwn@dPqh@`UsnA|d@e|@f@ox@?kbAkFibAqGkr@cP{i@kQwdAoAqm@mL}o@fKy^pRak@rRqcAmA{i@zNsiA|NkmAbE{_A{C}o@sRsh@qRiw@}Ciw@pG{_AbEwy@wHiw@?cv@bEox@bEiw@aJibAwHu~@oA_fA?ox@cEiw@{CePs]mAuXcf@bPaJd[yStXuXxSss@`J_fAuB_qAg@iw@uBaqA?wy@e@_qAlAwdAzCck@rRfKfVkg@jQibAtMydA|NwoA~IosAxHs~@xH_fAf@mg@{Sav@dPwn@pRav@tM}jAbEegAjFs]nW_fAtMun@`UydAvHegAe@kbAtBsiAg@uiAzCydApG{_AvM{_AfKak@jQjFlW``@`Ub[d[`U`Uj\\tX~pAxHvc@~TvoAnLd[nWxi@fVhl@rRtXtX|NhVbEb[g@hVob@lWmLhVk\\`UisBpGoW|YroBvHn~AnLvuBlArs@nb@~Il\\|YfV``@fVgrAzSy^tX{t@fV{jAxS}uArRg}ApRgnCrRy^r]}rDlLaKxCum@nQskD}NenCrRujB~M',
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
        ['mseC`~}Aig@tRaz@xFeAzJnPl[|~A`Cp@i`@gHwXeCyK'],
    ],
];
function p(a) {
    const o = {};
    for (let i = 0; i < K.length; i += 1) if (a[i] != null) o[K[i]] = a[i];
    return o;
}
function r(s) {
    let i = 0,
        x = 0,
        y = 0;
    const a = [];
    function n() {
        let v = 0,
            k = 0,
            b;
        do {
            b = s.charCodeAt(i++) - 63;
            v += (b & 31) * 2 ** k;
            k += 5;
        } while (b & 32);
        return v % 2 ? -(v + 1) / 2 : v / 2;
    }
    while (i < s.length) {
        x += n();
        y += n();
        a.push([x / S, y / S]);
    }
    return a;
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
