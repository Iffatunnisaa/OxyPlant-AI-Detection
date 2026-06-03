import bannerUrl from '../img/banner.png'
import d2Url from '../img/d2.jpeg'
import gmBgUrl from '../img/gm_bg.png'
import home1Url from '../img/home1.png'
import home2Url from '../img/home2.png'
import home3Url from '../img/home3.png'
import piAboutUrl from '../img/pi_about.png'
import plantUrl from '../img/plant.jpeg'
import profilUrl from '../img/profil.jpeg'

import './recommendation'

const oxyplantAssets = {
	banner: bannerUrl,
	d2: d2Url,
	gmBg: gmBgUrl,
	home1: home1Url,
	home2: home2Url,
	home3: home3Url,
	piAbout: piAboutUrl,
	plant: plantUrl,
	profil: profilUrl,
}

function applyOxyplantAssets(root = document) {
	root.querySelectorAll('[data-oxyplant-asset]').forEach((node) => {
		const assetKey = node.getAttribute('data-oxyplant-asset')
		const assetUrl = assetKey ? oxyplantAssets[assetKey] : null

		if (!assetUrl) {
			return
		}

		if (node instanceof HTMLImageElement) {
			const currentSrc = node.getAttribute('src') || ''
			const isPlaceholderSrc = !currentSrc || currentSrc.startsWith('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==')

			if (isPlaceholderSrc) {
				node.src = assetUrl
			}
			return
		}

		node.style.backgroundImage = `url("${assetUrl}")`
	})
}

if (typeof window !== 'undefined') {
	window.oxyplantAssets = oxyplantAssets

	document.addEventListener('DOMContentLoaded', () => {
		applyOxyplantAssets()
	})
}

export { applyOxyplantAssets, oxyplantAssets }
