# This file is part of Indico.
# Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
#
# Indico is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 3 of the
# License, or (at your option) any later version.
#
# Indico is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Indico; if not, see <http://www.gnu.org/licenses/>.

from __future__ import unicode_literals

from indico.core.plugins import IndicoPluginBlueprint

from indico_ursh.controllers import RHDisplayShortenURLPage, RHGetShortURL, RHDisplayCustomShortenURLPage

blueprint = IndicoPluginBlueprint('ursh', 'indico_ursh')
blueprint.add_url_rule('/ursh', 'get_short_url', RHGetShortURL, methods=('POST',))
blueprint.add_url_rule('/url-shortener', 'shorten_url', RHDisplayShortenURLPage)
# blueprint.add_url_rule('/custom-url-shortener', 'shorten_url_custom', RHDisplayCustomShortenURLPage)

blueprint.add_url_rule('/event/<confId>/short-url', 'shorten_url_custom', RHDisplayCustomShortenURLPage)
