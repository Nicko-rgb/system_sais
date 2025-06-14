import React, { useState, useEffect } from "react";
import "../styles/sector.css";
import { PiGearBold } from "react-icons/pi";
import { TbListCheck, TbMapPinCog } from "react-icons/tb";
import { RiLogoutCircleLine, RiPuzzleFill } from "react-icons/ri";
import { GrMapLocation } from "react-icons/gr";
import { FaRoad } from "react-icons/fa6";
import { MdTsunami, MdOutlineViewInAr } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Mapa from "../components/MapsSector/Mapa";
import Coordenada from "../data/CoodenadaMap";
import puntoCar from '../assets/img/puntoCardinal.png'
import mbba_b from '../assets/img/mb-ab.png'
import MiniMap from "../components/MapsSector/MiniMap";
import Config from "../components/MapsSector/Config";
import DataMz from "../components/MapsSector/DataMz";
import TablaSectorPer from "../components/MapsSector/TablaSectorPer";
import Loader from "../components/Loading/Loading";
import useStoreMap from "../components/MapsSector/StoreMap";

const Sectores = () => {
    const navigate = useNavigate();
    const { colors } = Coordenada()
    const { selectManzana, setSelectManzana} = useStoreMap()

    // Estados
    const [activeView, setActiveView] = useState(null);
    // const [selectManzana, setSelectManzana] = useState(null);
    const [viewDataMap, setViewDataMap] = useState(true)
    const [loading, setLoading] = useState(false);

    // Funciones de navegación
    const volverPage = () => navigate('/dashboard');

    const handleViewChange = (view) => {
        setActiveView(activeView === view ? null : view);
        setSelectManzana(null);
    };

    useEffect(() => {
        if (selectManzana) {
            setActiveView("datamz");
        }
    }, [selectManzana]);

    useEffect(() => {
        setLoading(false);
        // cargamos Loader por un segundo
        setTimeout(() => {
            setLoading(true);
        }, 1000);
    }, []);

    // Componentes de vistas
    const renderView = () => {
        switch (activeView) {
            case "config":
                return (
                    <Config />
                );
            case "datamz":
                return (
                    selectManzana ? (
                        <DataMz manzana={selectManzana} />
                    ) : (
                        <p style={{ textAlign: 'center' }}>Selecciona una manzana</p>
                    )
                );
            case "list":
                return (
                    <TablaSectorPer />
                );
            default:
                return null;
        }
    };

    return (
        <div className="sector">
            <h3 className="title-view">Mapa del Centro de Salud Micaela Bastidas</h3>
            <div className="ev">
                <div className="menus">
                    <div onClick={() => handleViewChange("config")}>
                        <PiGearBold className={`icon ${activeView === "config" ? "active" : ""}`} />
                        <p className="etiqueta">Configuración</p>
                    </div>
                    <div onClick={() => handleViewChange("datamz")}>
                        <TbMapPinCog className={`icon ${activeView === "datamz" ? "active" : ""}`} />
                        <p className="etiqueta">Datos de Manzana</p>
                    </div>
                    <div onClick={() => handleViewChange("list")}>
                        <TbListCheck className={`icon ${activeView === "list" ? "active" : ""}`} />
                        <p className="etiqueta">Profesionales con Sector</p>
                    </div>
                    <div onClick={volverPage}>
                        <RiLogoutCircleLine className="icon" />
                        <p className="etiqueta">Salir</p>
                    </div>
                    <div onClick={() => setViewDataMap(!viewDataMap)} className={`mapIco ${viewDataMap ? 'active' : ''}`} style={{ bottom: '50px' }}>
                        <MdOutlineViewInAr className="icon" />
                        <p className="etiqueta">Ver Datos</p>
                    </div>
                    <div className="mapIco">
                        <GrMapLocation className="map" />
                        <span>SAIS</span>
                    </div>
                </div>
                <section className={`nodatas ${activeView ? "datass" : ""}`}>
                    {renderView()}
                </section>
                <main className="mapa-box">
                    {!loading ? (
                        <Loader message={'Cargando Mapa...'} />
                    ) : (
                        <>
                            <h3 className={`h4 ${viewDataMap ? '' : 'noView'}`}>
                                PLANO DE LA JURISDICCION DEL EESS <br />
                                CENTRO DE SALUD MICAELA BASTIDA
                            </h3>
                            <div className={`legend ${viewDataMap ? '' : 'noView'}`}>
                                <h4>Leyenda</h4>
                                <h5>Categorias</h5>
                                <p><RiPuzzleFill style={{ color: colors.deporte }} />Deporte</p>
                                <p><RiPuzzleFill style={{ color: colors.educacion }} />Educación</p>
                                <p><RiPuzzleFill style={{ color: colors.espacimiento }} />Esparcimiento</p>
                                <p><RiPuzzleFill style={{ color: colors.estado }} />Estado</p>
                                <p><RiPuzzleFill style={{ color: colors.iglesia }} />Iglesia</p>
                                <p><RiPuzzleFill style={{ color: colors.industria }} />Industria</p>
                                <p><RiPuzzleFill style={{ color: colors.mercado }} />Mercado</p>
                                <p><RiPuzzleFill style={{ color: colors.salud }} />Salud</p>
                                <p><RiPuzzleFill style={{ color: colors.viviendas }} />Viviendas</p>
                                <p><MdTsunami style={{ color: colors.hidrografia }} />Hidrografía</p>
                                <p><FaRoad style={{ color: colors.calles }} />Vias_Final</p>
                                <p><span style={{ backgroundColor: colors.mz2021 }} />Manzanas_2021</p>
                            </div>
                            <img className={`img1 ${viewDataMap ? '' : 'noView'}`} src={mbba_b} alt="" />
                            <img className={`img2 ${viewDataMap ? '' : 'noView'}`} src={puntoCar} alt="" />
                            <MiniMap viewDataMap={viewDataMap} />
                            <Mapa selectManzana={selectManzana} setSelectManzana={setSelectManzana} />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Sectores;
