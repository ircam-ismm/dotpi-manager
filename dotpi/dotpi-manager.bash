#!/bin/bash

# source this file to add functions to the dotpi environment

dotpi_manager_update() (
  if [[ "$USER" != "root" ]]; then
    dotpi echo_error "This command must be run as root"
    return 1
  fi

  _dotpi_command="$(basename -- "${FUNCNAME[0]:-"$0"}")"
  log_file="${DOTPI_ROOT}/var/log/${_dotpi_command}_$(date +"%Y%m%d-%H%M%S").log"
  exec &> >(dotpi log "$log_file")

  dotpi echo_info "Log of dotpi-manager update: ${log_file}"

  destination="${DOTPI_ROOT}/share/dotpi-manager"
  mkdir -p -- "$destination" || {
    dotpi echo_error "dotpi-manager: could not create directory: ${destination}"
    return 1
  }
  cd -- "$destination" || {
    dotpi echo_error "dotpi-manager: could not change to directory: ${destination}"
    return 1
  }

  service_name='dotpi-manager.service'

  dotpi service_uninstall --user "$service_name"

  runtime_relative_path='runtime'
  destination_runtime="${destination}/${runtime_relative_path}"

  rm -rf -- "$destination_runtime"
  git clone --depth=1 https://github.com/ircam-ismm/dotpi-manager.git "$destination_runtime" || {
    dotpi echo_error "dotpi-manager: could not clone repositoryin in ${destination}"
    return 1
  }
  (
    cd -- "$destination_runtime" || {
      dotpi echo_error "could not change directory to runtime: ${destination_runtime}"
      exit 1
    }
    npm install --omit dev --loglevel verbose
  )

  ln -s -- "${runtime_relative_path}/dotpi/dotpi-manager.bash" "$destination/dotpi-manager.bash" || {
    dotpi echo_error "dotpi-manager: could not create symlink in ${destination}"
    return 1
  }

  ln -s -- "${runtime_relative_path}/dotpi/dotpi-manager.service" "$destination/dotpi-manager.service" || {
    dotpi echo_error "dotpi-manager: could not create symlink in ${destination}"
    return 1
  }

  # user service: allow to run as the user
  chmod -R a+r "$destination"
  chmod a+x "$destination" "$destination_runtime"

  dotpi service_install --user "${DOTPI_ROOT}/share/dotpi-manager/dotpi-manager.service"
)
