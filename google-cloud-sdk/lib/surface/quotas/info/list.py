# -*- coding: utf-8 -*- #
# Copyright 2024 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""QuotaInfo list command."""

from googlecloudsdk.api_lib.quotas import quota_info
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.quotas import flags


@base.ReleaseTracks(base.ReleaseTrack.ALPHA)
@base.UniverseCompatible
class ListAlpha(base.ListCommand):
  """List QuotaInfos of all quotas for a given project, folder or organization.

  ## EXAMPLES

  To list all quota info for service `example.googleapis.com` and
  `projects/12321`, run:

    $ {command} --service=example.googleapis.com --project=12321
    $ {command} --service=example.googleapis.com --project=my-project-id

   To list first 100 quota info ordered alphabetically for service
   `example.googleapis.com` and `folders/12321`,
   run:

    $ {command} --service=example.googleapis.com --folder=12321 --page-size=100
  """

  @staticmethod
  def Args(parser):
    """Args is called by calliope to gather arguments for this command.

    Args:
      parser: An argparse parser that you can use to add arguments that go on
        the command line after this command. Positional arguments are allowed.
    """
    flags.AddResourceFlags(parser, 'quota info to list')
    flags.Service().AddToParser(parser)

  def Run(self, args):
    """Run command.

    Args:
      args: argparse.Namespace, The arguments that this command was invoked
        with.

    Returns:
      List of QuotaInfo for specified container and service.
    """
    # This is because alpha gcloud points to GA version of the API.
    return quota_info.ListQuotaInfo(args, release_track=base.ReleaseTrack.GA)


@base.Hidden
@base.ReleaseTracks(base.ReleaseTrack.BETA)
@base.UniverseCompatible
class ListBeta(base.ListCommand):
  """List QuotaInfos of all quotas for a given project, folder or organization.

  ## EXAMPLES

  To list all quota info for service `example.googleapis.com` and
  `projects/12321`, run:

    $ {command} --service=example.googleapis.com --project=12321
    $ {command} --service=example.googleapis.com --project=my-project-id

   To list first 100 quota info ordered alphabetically for service
   `example.googleapis.com` and `folders/12321`,
   run:

    $ {command} --service=example.googleapis.com --folder=12321 --page-size=100
  """

  @staticmethod
  def Args(parser):
    """Args is called by calliope to gather arguments for this command.

    Args:
      parser: An argparse parser that you can use to add arguments that go on
        the command line after this command. Positional arguments are allowed.
    """
    flags.AddResourceFlags(parser, 'quota info to list')
    flags.Service().AddToParser(parser)

  def Run(self, args):
    """Run command.

    Args:
      args: argparse.Namespace, The arguments that this command was invoked
        with.

    Returns:
      List of QuotaInfo for specified container and service.
    """
    return quota_info.ListQuotaInfo(args, release_track=base.ReleaseTrack.BETA)
