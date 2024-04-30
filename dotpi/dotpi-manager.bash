#!/bin/bash

# source this file to add functions to the dotpi environment

dotpi_manager_update() (
  if [[ "$USER" != "root" ]]; then
    dotpi_echo_error "This command must be run as root"
    return 1
  fi

  _dotpi_command="$(basename -- "${FUNCNAME[0]:-"$0"}")"
  log_file="${DOTPI_ROOT}/var/log/${_dotpi_command}_$(date +"%Y%m%d-%H%M%S").log"
  exec &> >(dotpi log "$log_file")

  dotpi echo_info "Log of dotpi-manager update: ${log_file}"

  destination="${DOTPI_ROOT}/share/dotpi-manager"
  mkdir -p -- "$destination" || {
    dotpi_echo_error "dotpi-manager: could not create directory: ${destination}"
    return 1
  }
  cd -- "$destination" || {
    dotpi_echo_error "dotpi-manager: could not change to runtime: ${destination}"
    return 1
  }

  service_name='dotpi-manager.service'

  dotpi service_uninstall --user "$service_name"

  destination_runtime="${destination}/runtime"

  rm -rf -- "$destination_runtime"
  mkdir -p -- "$destination_runtime" || {
    dotpi_echo_error "dotpi-manager: could not create runtime directory: ${destination_runtime}"
    return 1
  }

  git clone --depth=1 https://github.com/ircam-ismm/dotpi-manager.git "$destination_runtime" || {
    dotpi_echo_error "dotpi-manager: could not clone repositoryin in ${destination}"
    return 1
  }

  ln -s -- "$destination_runtime/dotpi/dotpi-manager.bash" "$destination/dotpi-manager.bash" || {
    dotpi_echo_error "dotpi-manager: could not create symlink in ${destination}"
    return 1
  }

  ln -s -- "$destination_runtime/dotpi/dotpi-manager.service" "$destination/dotpi-manager.service" || {
    dotpi_echo_error "dotpi-manager: could not create symlink in ${destination}"
    return 1
  }

  (
    cd -- "$destination_runtime" || {
      dotpi_echo_error "could not change directory to runtime: ${destination_runtime}"
      exit 1
    }
    npm install --omit=dev --loglevel verbose
  )

  # user service: allow to run as the user
  chmod -R a+r "$destination"
  chmod a+x "$destination" "$destination_runtime"

  dotpi service_install --user "${DOTPI_ROOT}/share/dotpi-manager/dotpi-manager.service"
)
